from datetime import timedelta

from django.utils import timezone

from ..models import AccountProfile, Audit, DoctorProfile, Patient
from .test_flows import HubTestCase


class ProfileTests(HubTestCase):
    url = "/api/v1/me/profile/"

    def test_patient_updates_own_profile_and_syncs_name(self):
        self.client.force_authenticate(self.p)
        response = self.client.patch(self.url, {
            "full_name": "Nome do Paciente", "phone": "+55 (11) 99999-0000",
            "email": "paciente@example.test", "birth_date": "1995-04-20",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.patient.refresh_from_db()
        self.p.refresh_from_db()
        self.assertEqual(self.patient.name, "Nome do Paciente")
        self.assertEqual(self.p.get_full_name(), self.patient.name)
        self.assertEqual(AccountProfile.objects.get(user=self.p).phone, "+55 (11) 99999-0000")
        self.assertEqual(self.client.get(self.url).data["patient"]["id"], str(self.patient.pk))
        self.assertTrue(Audit.objects.filter(actor=self.p, action="profile_updated").exists())

    def test_doctor_details_are_declared_and_not_verified(self):
        DoctorProfile.objects.create(user=self.b)
        self.client.force_authenticate(self.b)
        response = self.client.patch(self.url, {
            "full_name": "Profissional Demo", "specialty": "Clínica geral",
            "registration_number": "123456", "registration_state": "SP",
        }, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["doctor"]["specialty"], "Clínica geral")
        self.assertFalse(response.data["doctor"]["registration_verified"])
        self.assertIsNone(response.data["patient"])
        self.assertEqual(self.client.patch(self.url, {"registration_state": ""}, format="json").status_code, 400)

    def test_profile_cannot_change_roles_ids_or_another_account(self):
        self.client.force_authenticate(self.p)
        for field, value in [("is_doctor", True), ("user_id", self.other.pk),
                             ("active", True), ("username", "outro"),
                             ("registration_verified", True)]:
            self.assertEqual(self.client.patch(self.url, {field: value}, format="json").status_code, 400)
        self.assertFalse(DoctorProfile.objects.filter(user=self.p).exists())
        other_name = Patient.objects.get(user=self.other).name
        self.client.patch(self.url, {"full_name": "Somente meu nome"}, format="json")
        self.assertEqual(Patient.objects.get(user=self.other).name, other_name)

    def test_invalid_fields_do_not_partially_update_account(self):
        self.client.force_authenticate(self.p)
        for data in [{"birth_date": (timezone.localdate() + timedelta(days=1)).isoformat()},
                     {"email": "email inválido"}, {"phone": "<script>"},
                     {"full_name": "   "}, {"specialty": "Não permitido"}]:
            response = self.client.patch(self.url, {"full_name": "Não salvar", **data}, format="json")
            self.assertEqual(response.status_code, 400)
        self.patient.refresh_from_db()
        self.assertEqual(self.patient.name, "Fictício")

    def test_profile_requires_authentication(self):
        self.assertEqual(self.client.get(self.url).status_code, 401)

    def test_doctor_cannot_edit_birth_date_or_enable_profile(self):
        doctor = DoctorProfile.objects.create(user=self.b, active=False)
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.patch(self.url, {"birth_date": "1990-01-01"}, format="json").status_code, 400)
        self.assertEqual(self.client.patch(self.url, {"active": True}, format="json").status_code, 400)
        doctor.refresh_from_db()
        self.assertFalse(doctor.active)
