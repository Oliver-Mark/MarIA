"""Ciclo de vida das autorizações e evidência do termo aceito."""

from datetime import timedelta

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from ..constants import GrantDecision, TERM_VERSION
from ..exceptions import StateConflict
from ..models import Audit, Grant, Patient
from ..permissions import (
    require_professional,
    require_doctor,
    require_local_patient,
    require_patient_account,
)


def build_term(grant):
    if grant.audience == Grant.Audience.DOCTOR:
        name = grant.requester.get_full_name() or grant.requester.username
        return (
            f"Autorizo o profissional {name} (usuário {grant.requester.username}, ID {grant.requester_id}) "
            f"a consultar os registros anteriores disponíveis no MarIA no momento do aceite, para: {grant.purpose}. "
            f"Validade: {grant.expires_at.isoformat()}. A autorização é pessoal, independente da clínica. "
            "Não inclui registros futuros nem transfere acesso a outros profissionais. "
            "Posso revogar novos acessos pelo portal. Protótipo acadêmico com dados fictícios."
        )
    return (
        f"Autorizo a equipe assistencial autorizada da clínica {grant.clinic.name} "
        "a consultar os registros anteriores disponíveis no MarIA no momento "
        f"do aceite, para: {grant.purpose}. "
        f"Validade: {grant.expires_at.isoformat()}. Não inclui registros futuros. "
        "Posso revogar novos acessos pelo portal. "
        "Protótipo acadêmico com dados fictícios."
    )


def request_access(*, actor, clinic_id, data):
    clinic = require_doctor(actor, clinic_id)
    patient = require_local_patient(clinic, data["patient_id"])
    if data["expires_at"] <= timezone.now():
        raise ValidationError({"expires_at": ["Informe uma validade futura."]})
    with transaction.atomic():
        grant = Grant(
            patient=patient,
            clinic=clinic,
            requester=actor,
            purpose=data["purpose"],
            expires_at=data["expires_at"],
            term_version=TERM_VERSION,
        )
        grant.term_text = build_term(grant)
        grant.save()
        Audit.objects.create(
            actor=actor,
            clinic=clinic,
            patient=patient,
            action="grant_requested",
            allowed=True,
        )
    return grant


def _apply_decision(grant, decision, term_version, now):
    if decision == GrantDecision.REVOKE:
        if grant.status != Grant.Status.APPROVED:
            raise StateConflict("Somente autorizações aprovadas podem ser revogadas.")
        grant.status = Grant.Status.REVOKED
        grant.revoked_at = now
        return
    if grant.status != Grant.Status.PENDING or grant.expires_at <= now:
        raise StateConflict("Solicitação não está pendente ou já venceu.")
    if decision == GrantDecision.APPROVE:
        if term_version != grant.term_version:
            raise ValidationError(
                {"term_version": ["Confirme a versão do termo apresentado."]}
            )
        grant.status = Grant.Status.APPROVED
        grant.approved_at = now
    elif decision == GrantDecision.DENY:
        grant.status = Grant.Status.DENIED
    else:
        raise ValidationError({"decision": ["Decisão desconhecida."]})


def decide_access(*, actor, grant_id, decision, term_version=None):
    patient = require_patient_account(actor)
    with transaction.atomic():
        grant = get_object_or_404(
            Grant.objects.select_for_update(of=("self",)).select_related("clinic"),
            pk=grant_id,
            patient=patient,
        )
        _apply_decision(grant, decision, term_version, timezone.now())
        grant.save(update_fields=["status", "approved_at", "revoked_at"])
        Audit.objects.create(
            actor=actor,
            clinic=grant.clinic,
            patient=patient,
            action=f"grant_{decision}",
            allowed=True,
        )
    return grant


def request_professional_access(*, actor, data):
    require_professional(actor)
    patient = get_object_or_404(Patient, pk=data["patient_id"])
    expires_at = timezone.now() + timedelta(days=data["duration_days"])
    with transaction.atomic():
        grant = Grant(
            patient=patient,
            requester=actor,
            audience=Grant.Audience.DOCTOR,
            purpose=data["purpose"],
            expires_at=expires_at,
            term_version="doctor-1",
        )
        grant.term_text = build_term(grant)
        grant.save()
        Audit.objects.create(
            actor=actor, patient=patient, action="doctor_grant_requested", allowed=True
        )
    return grant
