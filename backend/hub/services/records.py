"""Recepção de registros e consulta ao histórico autorizado."""

from dataclasses import dataclass

from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from ..exceptions import StateConflict
from ..models import Attachment, Audit, Patient, PatientLink, Record
from .attachments import attach_file
from ..constants import LIST_LIMIT
from ..permissions import (
    require_patient_account,
    require_professional,
    require_doctor,
    require_integration,
    require_local_patient,
)
from ..selectors import (
    active_grants_for_update,
    visible_records,
    professional_grants_for_update,
    professional_records,
    authored_records,
)


@dataclass(frozen=True)
class HistoryResult:
    records: list
    external_access: bool


def ingest_record(*, actor, integration_key, data):
    integration = require_integration(integration_key)
    require_doctor(actor, integration.clinic_id)
    patient = get_object_or_404(
        PatientLink, clinic=integration.clinic, external_id=data["external_patient_id"]
    ).patient
    if data["occurred_at"] > timezone.now():
        raise ValidationError(
            {"occurred_at": ["Atendimento não pode estar no futuro."]}
        )
    with transaction.atomic():
        record, created = Record.objects.get_or_create(
            integration=integration,
            external_id=data["external_id"],
            defaults={
                "patient": patient,
                "author": actor,
                "occurred_at": data["occurred_at"],
                "summary": data["summary"],
            },
        )
        same_content = (
            record.patient_id == patient.pk
            and record.author_id == actor.pk
            and record.occurred_at == data["occurred_at"]
            and record.summary == data["summary"]
        )
        Audit.objects.create(
            actor=actor,
            clinic=integration.clinic,
            patient=patient,
            action="ingest" if same_content else "ingest_conflict",
            allowed=same_content,
            record_ids=[str(record.pk)],
        )
    # Raise after committing so denied operations keep their audit entry.
    if not same_content:
        raise StateConflict(
            "Identificador já recebido com conteúdo diferente; correções ainda não suportadas."
        )
    return record, created


def read_history(*, actor, clinic_id, patient_id):
    clinic = require_doctor(actor, clinic_id)
    patient = require_local_patient(clinic, patient_id)
    with transaction.atomic():
        grants = active_grants_for_update(patient, clinic, timezone.now())
        owns_records = Record.objects.filter(
            patient=patient, integration__clinic=clinic
        ).exists()
        allowed = bool(grants) or owns_records
        records = list(visible_records(patient, clinic, grants)) if allowed else []
        Audit.objects.create(
            actor=actor,
            clinic=clinic,
            patient=patient,
            action="history",
            allowed=allowed,
            record_ids=[str(record.pk) for record in records],
        )
    if not allowed:
        raise PermissionDenied("Sem autorização vigente para histórico externo.")
    return HistoryResult(records=records, external_access=bool(grants))


def read_professional_history(*, actor, patient_id):

    require_professional(actor)
    patient = get_object_or_404(Patient, pk=patient_id)
    with transaction.atomic():
        grants = professional_grants_for_update(patient, actor, timezone.now())
        records = list(professional_records(patient, grants)) if grants else []
        Audit.objects.create(
            actor=actor,
            patient=patient,
            action="doctor_history",
            allowed=bool(grants),
            record_ids=[str(record.pk) for record in records],
        )
    if not grants:
        raise PermissionDenied("Sem autorização pessoal vigente para este histórico.")
    return HistoryResult(records=records, external_access=True)


def create_professional_record(*, actor, patient_id, data):
    require_professional(actor)
    patient = get_object_or_404(Patient, pk=patient_id)
    clinic = require_doctor(actor, data["clinic_id"]) if data.get("clinic_id") else None
    with transaction.atomic():
        grants = professional_grants_for_update(patient, actor, timezone.now())
        record = None
        if grants:
            record = Record.objects.create(
                patient=patient,
                author=actor,
                source_clinic=clinic,
                occurred_at=data["occurred_at"],
                summary=data["summary"],
            )
        if record:
            attach_file(record, data.get("attachment"))
        Audit.objects.create(
            actor=actor,
            patient=patient,
            clinic=clinic,
            action="doctor_record_create",
            allowed=bool(grants),
            record_ids=[str(record.pk)] if record else [],
        )
    if record is None:
        raise PermissionDenied(
            "É necessária autorização pessoal vigente para registrar atendimento."
        )
    return record


def read_authored_records(*, actor, patient_id):
    require_professional(actor)
    # No diretório público: apenas pacientes com registros do próprio autor.
    patient = get_object_or_404(
        Patient.objects.filter(record__author=actor).distinct(), pk=patient_id
    )
    records = list(authored_records(patient, actor))
    Audit.objects.create(
        actor=actor,
        patient=patient,
        action="doctor_own_history",
        allowed=True,
        record_ids=[str(record.pk) for record in records],
    )
    return HistoryResult(records=records, external_access=False)


def read_patient_history(*, actor):
    patient = require_patient_account(actor)
    records = list(Record.objects.filter(patient=patient).select_related(
        "patient", "author", "source_clinic", "integration__clinic"
    ).prefetch_related(Prefetch("attachments", queryset=Attachment.objects.defer("data"))).order_by("-occurred_at", "pk")[:LIST_LIMIT])
    Audit.objects.create(actor=actor, patient=patient, action="patient_history",
                         allowed=True, record_ids=[str(record.pk) for record in records])
    return records


def create_patient_record(*, actor, data):
    patient = require_patient_account(actor)
    with transaction.atomic():
        record = Record.objects.create(patient=patient, author=actor,
                                       occurred_at=data["occurred_at"], summary=data["summary"])
        attach_file(record, data.get("attachment"))
        Audit.objects.create(actor=actor, patient=patient, action="patient_record_create",
                             allowed=True, record_ids=[str(record.pk)])
    return record
