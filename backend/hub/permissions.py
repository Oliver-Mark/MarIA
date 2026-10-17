"""Verificações de identidade, vínculo e contexto usadas pelos serviços."""

from uuid import UUID

from django.contrib.auth.hashers import check_password
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from .models import (
    DoctorProfile,
    Audit,
    Clinic,
    Integration,
    Membership,
    Patient,
    PatientLink,
)


def require_doctor(user, clinic_id):
    clinic = get_object_or_404(Clinic, pk=clinic_id)
    membership_exists = Membership.objects.filter(
        user=user, clinic=clinic, role=Membership.Role.DOCTOR, active=True
    ).exists()
    if not membership_exists:
        Audit.objects.create(
            actor=user, clinic=clinic, action="membership_denied", allowed=False
        )
        raise PermissionDenied("Vínculo assistencial não autorizado.")
    return clinic


def require_integration(raw_key):
    try:
        identifier, secret = raw_key.split(".", 1)
        integration_id = UUID(identifier)
    except (ValueError, AttributeError):
        raise PermissionDenied("Integração não autorizada.") from None
    integration = (
        Integration.objects.filter(pk=integration_id, active=True)
        .select_related("clinic")
        .first()
    )
    if integration is None or not check_password(secret, integration.key_hash):
        raise PermissionDenied("Integração não autorizada.")
    return integration


def require_local_patient(clinic, patient_id):
    link = get_object_or_404(
        PatientLink.objects.select_related("patient"),
        clinic=clinic,
        patient_id=patient_id,
    )
    return link.patient


def require_patient_account(user):
    return get_object_or_404(Patient, user=user)


def require_professional(user):
    if not DoctorProfile.objects.filter(
        user=user, active=True, user__is_active=True
    ).exists():
        raise PermissionDenied("Perfil profissional não habilitado no HUB.")
    return user
