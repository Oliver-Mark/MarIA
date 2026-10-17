from datetime import date, timedelta
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from django.test import override_settings
from rest_framework.test import APITestCase
from ..models import (
    Audit,
    Clinic,
    Grant,
    Integration,
    Membership,
    Patient,
    PatientLink,
    Record,
)


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class HubTestCase(APITestCase):
    def setUp(self):
        user = get_user_model()
        self.a = user.objects.create_user("doctor_a", password="demo-password-123")
        self.b = user.objects.create_user("doctor_b", password="demo-password-123")
        self.p = user.objects.create_user("patient", password="demo-password-123")
        self.other = user.objects.create_user("other", password="demo-password-123")
        self.reception = user.objects.create_user(
            "reception", password="demo-password-123"
        )
        self.ca = Clinic.objects.create(name="A")
        self.cb = Clinic.objects.create(name="B")
        Membership.objects.create(user=self.a, clinic=self.ca, role="doctor")
        Membership.objects.create(user=self.b, clinic=self.cb, role="doctor")
        Membership.objects.create(user=self.reception, clinic=self.cb, role="reception")
        self.patient = Patient.objects.create(
            user=self.p, name="Fictício", birth_date=date(1995, 1, 1)
        )
        Patient.objects.create(
            user=self.other, name="Outro", birth_date=date(1990, 1, 1)
        )
        for clinic in [self.ca, self.cb]:
            PatientLink.objects.create(
                patient=self.patient, clinic=clinic, external_id="local"
            )
        self.integration = Integration.objects.create(
            clinic=self.ca, name="demo", key_hash=make_password("secret")
        )
        self.history = (
            f"/api/v1/clinics/{self.cb.pk}/patients/{self.patient.pk}/history/"
        )
        self.data = {
            "external_patient_id": "local",
            "external_id": "visit-1",
            "occurred_at": (timezone.now() - timedelta(days=1)).isoformat(),
            "summary": "Fictício",
        }

    def ingest(self):
        self.client.force_authenticate(self.a)
        return self.client.post(
            "/api/v1/integration/records/",
            self.data,
            format="json",
            HTTP_X_INTEGRATION_KEY=f"{self.integration.pk}.secret",
        )

    def request(self):
        self.client.force_authenticate(self.b)
        result = self.client.post(
            f"/api/v1/clinics/{self.cb.pk}/grants/",
            {
                "patient_id": str(self.patient.pk),
                "purpose": "Continuidade",
                "expires_at": (timezone.now() + timedelta(days=30)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(result.status_code, 201)
        return result.data["id"]

    def decision(self, pk, action, who=None):
        self.client.force_authenticate(who or self.p)
        return self.client.post(
            f"/api/v1/patient/grants/{pk}/decision/",
            {"decision": action, "term_version": "demo-1"},
            format="json",
        )


class HubFlowTests(HubTestCase):
    def test_end_to_end_grant_and_revocation(self):
        self.assertEqual(self.ingest().status_code, 201)
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.history).status_code, 403)
        grant = self.request()
        self.assertEqual(self.client.get(self.history).status_code, 403)
        self.assertEqual(self.decision(grant, "approve").status_code, 200)
        self.client.force_authenticate(self.b)
        response = self.client.get(self.history)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["records"][0]["clinic_name"], "A")
        self.assertEqual(len(response.data["records"]), 1)
        self.assertTrue(Audit.objects.filter(action="history", allowed=True).exists())
        self.assertEqual(self.decision(grant, "revoke").status_code, 200)
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.history).status_code, 403)

    def test_duplicate_and_conflicting_payload(self):
        self.assertEqual(self.ingest().status_code, 201)
        self.assertEqual(self.ingest().status_code, 200)
        self.data["summary"] = "Alterado"
        self.assertEqual(self.ingest().status_code, 409)
        self.assertEqual(Record.objects.count(), 1)
        self.assertEqual(Record.objects.get().summary, "Fictício")

    def test_other_patient_cannot_decide(self):
        grant = self.request()
        self.assertEqual(self.decision(grant, "approve", self.other).status_code, 404)

    def test_reception_and_cross_tenant_denied(self):
        for actor in [self.reception, self.a]:
            self.client.force_authenticate(actor)
            self.assertEqual(self.client.get(self.history).status_code, 403)

    def test_expired_grant_denied(self):
        self.ingest()
        grant = self.request()
        self.decision(grant, "approve")
        Grant.objects.filter(pk=grant).update(
            requested_at=timezone.now() - timedelta(days=3),
            approved_at=timezone.now() - timedelta(days=2),
            expires_at=timezone.now() - timedelta(days=1),
        )
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.history).status_code, 403)

    def test_bad_integration_and_wrong_actor_denied(self):
        self.client.force_authenticate(self.a)
        self.assertEqual(
            self.client.post(
                "/api/v1/integration/records/",
                self.data,
                format="json",
                HTTP_X_INTEGRATION_KEY=f"{self.integration.pk}.wrong",
            ).status_code,
            403,
        )
        self.client.force_authenticate(self.b)
        self.assertEqual(
            self.client.post(
                "/api/v1/integration/records/",
                self.data,
                format="json",
                HTTP_X_INTEGRATION_KEY=f"{self.integration.pk}.secret",
            ).status_code,
            403,
        )

    def test_future_records_not_in_scope(self):
        self.ingest()
        grant = self.request()
        self.decision(grant, "approve")
        self.data["external_id"] = "visit-2"
        self.ingest()
        self.client.force_authenticate(self.b)
        result = self.client.get(self.history)
        self.assertEqual(len(result.data["records"]), 1)

    def test_login_issues_jwt_and_anonymous_denied(self):
        self.assertEqual(self.client.get(self.history).status_code, 401)
        response = self.client.post(
            "/api/v1/auth/login/",
            {"username": "doctor_b", "password": "demo-password-123"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION="Bearer " + response.data["access"])
        self.assertEqual(self.client.get("/api/v1/me/").status_code, 200)

    def test_demo_page(self):
        response = self.client.get("/demo/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Portal do paciente")
