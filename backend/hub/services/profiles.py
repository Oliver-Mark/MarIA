"""Consulta e edição dos dados da própria conta, sem alterar papéis ou credenciais."""

from django.db import transaction
from rest_framework.exceptions import ValidationError

from ..models import AccountProfile, Audit, DoctorProfile, Patient


def read_profile(actor):
    patient = Patient.objects.filter(user=actor).first()
    doctor = DoctorProfile.objects.filter(user=actor).first()
    contact = AccountProfile.objects.filter(user=actor).first()
    return {
        "username": actor.username,
        "full_name": patient.name if patient else actor.get_full_name(),
        "email": actor.email,
        "phone": contact.phone if contact else "",
        "patient": {"id": str(patient.pk), "birth_date": patient.birth_date} if patient else None,
        "doctor": {
            "active": doctor.active,
            "specialty": doctor.specialty,
            "registration_number": doctor.registration_number,
            "registration_state": doctor.registration_state,
            "registration_verified": False,
        } if doctor else None,
    }


def update_profile(*, actor, data):
    with transaction.atomic():
        # Serializa alterações da mesma conta, inclusive a criação do contato.
        actor = type(actor).objects.select_for_update().get(pk=actor.pk)
        patient = Patient.objects.filter(user=actor).first()
        doctor = DoctorProfile.objects.filter(user=actor).first()
        if "birth_date" in data and not patient:
            raise ValidationError({"birth_date": "Esta conta não possui perfil de paciente."})
        professional_fields = ("specialty", "registration_number", "registration_state")
        if any(field in data for field in professional_fields) and not doctor:
            raise ValidationError("Esta conta não possui perfil profissional.")
        if doctor:
            number = data.get("registration_number", doctor.registration_number)
            state = data.get("registration_state", doctor.registration_state)
            if bool(number) != bool(state):
                raise ValidationError("Preencha o CRM e a UF juntos, ou deixe ambos vazios.")
            for field in professional_fields:
                if field in data:
                    setattr(doctor, field, data[field])
            doctor.save(update_fields=professional_fields)
        if "full_name" in data:
            parts = data["full_name"].split(maxsplit=1)
            actor.first_name, actor.last_name = parts[0], parts[1] if len(parts) > 1 else ""
            if patient:
                patient.name = data["full_name"]
        if "email" in data:
            actor.email = data["email"]
        actor.save(update_fields=["first_name", "last_name", "email"])
        if patient:
            if "birth_date" in data:
                patient.birth_date = data["birth_date"]
            patient.save(update_fields=["name", "birth_date"])
        if "phone" in data:
            AccountProfile.objects.update_or_create(user=actor, defaults={"phone": data["phone"]})
        Audit.objects.create(actor=actor, patient=patient, action="profile_updated", allowed=True)
    return read_profile(actor)
