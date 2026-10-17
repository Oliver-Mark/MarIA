"""Consultas reutilizáveis. A autorização da operação ocorre nos serviços."""

from django.db.models import Q, Prefetch

from .constants import LIST_LIMIT
from .models import Attachment, DoctorProfile, Grant, Membership, Patient, PatientLink, Record


def user_context(user):
    memberships = Membership.objects.filter(user=user, active=True).select_related(
        "clinic"
    )
    patient = Patient.objects.filter(user=user).first()
    return {
        "user_id": user.pk,
        "is_doctor": DoctorProfile.objects.filter(user=user, active=True).exists(),
        "username": user.username,
        "patient_id": str(patient.pk) if patient else None,
        "clinics": [
            {"id": str(link.clinic_id), "name": link.clinic.name, "role": link.role}
            for link in memberships
        ],
    }


def local_patients(clinic):
    return (
        PatientLink.objects.filter(clinic=clinic)
        .select_related("patient")
        .order_by("patient__name", "pk")[:LIST_LIMIT]
    )


def patient_grants(patient):
    return (
        Grant.objects.filter(patient=patient)
        .select_related("clinic", "requester", "patient")
        .order_by("-requested_at", "pk")[:LIST_LIMIT]
    )


def active_grants_for_update(patient, clinic, now):
    # Evaluate inside a transaction. Lock grants in a stable order.
    return list(
        Grant.objects.select_for_update()
        .filter(
            patient=patient,
            clinic=clinic,
            audience=Grant.Audience.CLINIC,
            status=Grant.Status.APPROVED,
            scope=Grant.Scope.PRIOR_RECORDS,
            expires_at__gt=now,
            revoked_at__isnull=True,
        )
        .order_by("pk")
    )


def visible_records(patient, clinic, grants):
    visibility = Q(integration__clinic=clinic)
    for grant in grants:
        visibility |= Q(
            occurred_at__lte=grant.approved_at, received_at__lte=grant.approved_at
        )
    return (
        Record.objects.filter(visibility, patient=patient)
        .select_related("integration__clinic", "source_clinic", "author", "patient")
        .prefetch_related(Prefetch("attachments", queryset=Attachment.objects.defer("data")))
        .order_by("-occurred_at", "pk")[:LIST_LIMIT]
    )


def professional_grants(actor):
    return (
        Grant.objects.filter(requester=actor, audience=Grant.Audience.DOCTOR)
        .select_related("patient", "requester", "clinic")
        .order_by("-requested_at", "pk")[:LIST_LIMIT]
    )


def professional_patients(actor):
    # A solicitação cria acompanhamento, não permissão de leitura do histórico.
    return (
        Patient.objects.filter(
            Q(grant__requester=actor, grant__audience=Grant.Audience.DOCTOR)
            | Q(record__author=actor)
        )
        .distinct()
        .order_by("name", "pk")[:LIST_LIMIT]
    )


def professional_grants_for_update(patient, actor, now):
    return list(
        Grant.objects.select_for_update()
        .filter(
            patient=patient,
            requester=actor,
            audience=Grant.Audience.DOCTOR,
            status=Grant.Status.APPROVED,
            expires_at__gt=now,
            revoked_at__isnull=True,
            scope=Grant.Scope.PRIOR_RECORDS,
        )
        .order_by("pk")
    )


def professional_records(patient, grants):
    visibility = Q(pk__in=[])
    for grant in grants:
        visibility |= Q(
            occurred_at__lte=grant.approved_at, received_at__lte=grant.approved_at
        )
    return (
        Record.objects.filter(visibility, patient=patient)
        .select_related("integration__clinic", "source_clinic", "author", "patient")
        .prefetch_related(Prefetch("attachments", queryset=Attachment.objects.defer("data")))
        .order_by("-occurred_at", "pk")[:LIST_LIMIT]
    )


def authored_records(patient, actor):
    return (
        Record.objects.filter(patient=patient, author=actor)
        .select_related("integration__clinic", "source_clinic", "author", "patient")
        .prefetch_related(Prefetch("attachments", queryset=Attachment.objects.defer("data")))
        .order_by("-occurred_at", "pk")[:LIST_LIMIT]
    )
