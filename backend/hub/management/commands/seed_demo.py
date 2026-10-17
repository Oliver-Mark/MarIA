import os
import secrets
from datetime import date
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from hub.models import (
    DoctorProfile,
    Clinic,
    Integration,
    Membership,
    Patient,
    PatientLink,
)


class Command(BaseCommand):
    help = "Cria duas clínicas e um paciente fictício. Reexecutar rotaciona credenciais demo."

    @transaction.atomic
    def handle(self, *args, **options):
        password = os.environ.get("MARIA_DEMO_PASSWORD")
        if not password or len(password) < 12:
            raise CommandError(
                "Defina MARIA_DEMO_PASSWORD com pelo menos 12 caracteres."
            )
        users = {}
        for name in ["medico_a", "medico_b", "paciente_demo", "recepcao_b"]:
            user, _ = get_user_model().objects.get_or_create(username=name)
            user.set_password(password)
            user.first_name = name.replace("_", " ").title()
            user.save()
            users[name] = user
        for name in ["medico_a", "medico_b"]:
            DoctorProfile.objects.get_or_create(user=users[name])
        patient, _ = Patient.objects.get_or_create(
            user=users["paciente_demo"],
            defaults={"name": "Paciente Fictício", "birth_date": date(1995, 3, 20)},
        )
        for suffix in ["a", "b"]:
            clinic, _ = Clinic.objects.get_or_create(
                name="Clínica Demo " + suffix.upper()
            )
            Membership.objects.get_or_create(
                user=users["medico_" + suffix],
                clinic=clinic,
                defaults={"role": "doctor"},
            )
            PatientLink.objects.get_or_create(
                patient=patient,
                clinic=clinic,
                defaults={"external_id": "paciente-demo"},
            )
            secret = secrets.token_urlsafe(32)
            integration, _ = Integration.objects.get_or_create(
                clinic=clinic, name="Sistema Demo", defaults={"key_hash": ""}
            )
            integration.key_hash = make_password(secret)
            integration.save()
            self.stdout.write(
                f"Clínica {suffix.upper()}: {clinic.pk}\nChave da integração (guardar localmente): {integration.pk}.{secret}"
            )
            if suffix == "b":
                Membership.objects.get_or_create(
                    user=users["recepcao_b"],
                    clinic=clinic,
                    defaults={"role": "reception"},
                )
        self.stdout.write(
            f"Paciente HUB: {patient.pk}\nUsuários: medico_a, medico_b, paciente_demo, recepcao_b. Senha: variável MARIA_DEMO_PASSWORD."
        )
