from datetime import timedelta

from django.db import IntegrityError, transaction
from django.utils import timezone

from ..models import Audit, DoctorProfile, Grant, Membership, PatientLink, Record
from .test_flows import HubTestCase


class ProfessionalAccessTests(HubTestCase):
    def setUp(self):
        super().setUp()
        DoctorProfile.objects.create(user=self.b)
        DoctorProfile.objects.create(user=self.a)
        self.url = f"/api/v1/doctor/patients/{self.patient.pk}/history/"

    def request_personal(self):
        self.client.force_authenticate(self.b)
        response = self.client.post(
            "/api/v1/doctor/grants/",
            {
                "patient_id": str(self.patient.pk),
                "purpose": "Continuidade pessoal",
                "duration_days": 10,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        return response.data["id"]

    def test_personal_duration_is_fixed_and_calculated_by_server(self):
        self.client.force_authenticate(self.b)
        for days in (10, 30, 60, 90):
            before = timezone.now()
            response = self.client.post("/api/v1/doctor/grants/", {
                "patient_id": str(self.patient.pk), "purpose": "Prazo predefinido",
                "duration_days": days,
            }, format="json")
            self.assertEqual(response.status_code, 201)
            grant = Grant.objects.get(pk=response.data["id"])
            self.assertGreaterEqual(grant.expires_at, before + timedelta(days=days))
            self.assertLessEqual(grant.expires_at, timezone.now() + timedelta(days=days))
            self.assertIn(grant.expires_at.isoformat(), grant.term_text)
        for duration in (0, -10, 15, 365, "inválido"):
            response = self.client.post("/api/v1/doctor/grants/", {
                "patient_id": str(self.patient.pk), "purpose": "Prazo inválido",
                "duration_days": duration,
            }, format="json")
            self.assertEqual(response.status_code, 400)
        response = self.client.post("/api/v1/doctor/grants/", {
            "patient_id": str(self.patient.pk), "purpose": "Data livre",
            "expires_at": (timezone.now() + timedelta(days=10)).isoformat(),
        }, format="json")
        self.assertEqual(response.status_code, 400)

    def approve(self, grant_id):
        self.client.force_authenticate(self.p)
        return self.client.post(
            f"/api/v1/patient/grants/{grant_id}/decision/",
            {"decision": "approve", "term_version": "doctor-1"},
            format="json",
        )

    def test_personal_flow_without_local_patient_or_membership(self):
        self.ingest()
        PatientLink.objects.filter(clinic=self.cb).delete()
        Membership.objects.filter(user=self.b).update(active=False)
        grant_id = self.request_personal()
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.assertEqual(len(self.client.get("/api/v1/doctor/patients/").data), 1)
        self.assertEqual(self.approve(grant_id).status_code, 200)
        self.client.force_authenticate(self.b)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["records"][0]["clinic_name"], "A")
        self.assertEqual(self.decision(grant_id, "revoke").status_code, 200)
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.assertTrue(
            Audit.objects.filter(action="doctor_history", allowed=False).exists()
        )

    def test_personal_grant_not_shared_with_other_professional(self):
        self.ingest()
        grant_id = self.request_personal()
        self.approve(grant_id)
        self.client.force_authenticate(self.a)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        # A autoria mantém o paciente na carteira, sem transferir o consentimento de B.
        self.assertEqual(len(self.client.get("/api/v1/doctor/patients/").data), 1)
        own = self.client.get(f"/api/v1/doctor/patients/{self.patient.pk}/records/")
        self.assertEqual(len(own.data["records"]), 1)

    def test_clinic_grant_does_not_become_personal_permission(self):
        self.ingest()
        grant_id = self.request()
        self.decision(grant_id, "approve")
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_reception_and_disabled_professional_denied(self):
        for actor in [self.reception, self.p]:
            self.client.force_authenticate(actor)
            self.assertEqual(
                self.client.get("/api/v1/doctor/patients/").status_code, 403
            )
        DoctorProfile.objects.filter(user=self.b).update(active=False)
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_expiry_and_snapshot_exclude_new_records(self):
        self.ingest()
        grant_id = self.request_personal()
        self.approve(grant_id)
        Record.objects.create(
            integration=self.integration,
            patient=self.patient,
            author=self.a,
            external_id="later",
            occurred_at=timezone.now() - timedelta(days=1),
            summary="Recebido depois",
        )
        self.client.force_authenticate(self.b)
        self.assertEqual(len(self.client.get(self.url).data["records"]), 1)
        Grant.objects.filter(pk=grant_id).update(
            requested_at=timezone.now() - timedelta(days=3),
            approved_at=timezone.now() - timedelta(days=2),
            expires_at=timezone.now() - timedelta(days=1),
        )
        self.assertEqual(self.client.get(self.url).status_code, 403)

    def test_patient_ownership_and_term_version(self):
        grant_id = self.request_personal()
        self.assertEqual(
            self.decision(grant_id, "approve", self.other).status_code, 404
        )
        self.assertEqual(self.decision(grant_id, "approve").status_code, 400)
        self.assertEqual(Grant.objects.get(pk=grant_id).status, "pending")

    def test_database_requires_consistent_recipient(self):
        grant_id = self.request_personal()
        with self.assertRaises(IntegrityError), transaction.atomic():
            Grant.objects.filter(pk=grant_id).update(clinic=self.ca)

    def test_new_pages_render_and_assets_resolve(self):
        from django.contrib.staticfiles import finders
        from django.test import Client

        client = Client()
        for url in ["/", "/hub/", "/hub/login/", "/demo/"]:
            self.assertEqual(client.get(url).status_code, 200)
        for asset in ["css/hub.css", "Js/hub.js", "css/login.css"]:
            self.assertIsNotNone(finders.find(asset))

    def create_native(self, **extra):
        self.client.force_authenticate(self.b)
        return self.client.post(
            f"/api/v1/doctor/patients/{self.patient.pk}/records/",
            {
                "occurred_at": (timezone.now() - timedelta(minutes=5)).isoformat(),
                "summary": "Atendimento direto",
                **extra,
            },
            format="json",
        )

    def test_native_record_and_own_history_after_revocation(self):
        self.ingest()
        grant_id = self.request_personal()
        self.approve(grant_id)
        response = self.create_native(author_id=self.a.pk)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["author_id"], self.b.pk)
        self.assertIsNone(response.data["clinic_id"])
        self.assertEqual(self.decision(grant_id, "revoke").status_code, 200)
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        own_url = f"/api/v1/doctor/patients/{self.patient.pk}/records/"
        own = self.client.get(own_url)
        self.assertEqual(own.status_code, 200)
        self.assertFalse(own.data["external_access"])
        self.assertEqual([r["id"] for r in own.data["records"]], [response.data["id"]])
        self.assertEqual(self.create_native().status_code, 403)
        self.client.force_authenticate(self.a)
        self.assertNotIn(
            response.data["id"],
            [r["id"] for r in self.client.get(own_url).data["records"]],
        )

    def test_native_creation_requires_grant_and_valid_context(self):
        self.assertEqual(self.create_native().status_code, 403)
        self.assertTrue(
            Audit.objects.filter(action="doctor_record_create", allowed=False).exists()
        )
        grant_id = self.request_personal()
        self.approve(grant_id)
        self.assertEqual(self.create_native(clinic_id=str(self.ca.pk)).status_code, 403)
        self.assertEqual(self.create_native(summary="   ").status_code, 400)
        self.assertEqual(
            self.create_native(
                occurred_at=(timezone.now() + timedelta(days=1)).isoformat()
            ).status_code,
            400,
        )
        response = self.create_native(clinic_id=str(self.cb.pk))
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["clinic_name"], "B")
        self.assertTrue(
            Audit.objects.filter(action="doctor_record_create", allowed=True).exists()
        )

    def test_native_expired_grant_and_disabled_doctor(self):
        grant_id = self.request_personal()
        self.approve(grant_id)
        self.assertEqual(self.create_native().status_code, 201)
        Grant.objects.filter(pk=grant_id).update(
            requested_at=timezone.now() - timedelta(days=3),
            approved_at=timezone.now() - timedelta(days=2),
            expires_at=timezone.now() - timedelta(days=1),
        )
        self.assertEqual(self.create_native().status_code, 403)
        own_url = f"/api/v1/doctor/patients/{self.patient.pk}/records/"
        self.assertEqual(self.client.get(own_url).status_code, 200)
        DoctorProfile.objects.filter(user=self.b).update(active=False)
        self.assertEqual(self.client.get(own_url).status_code, 403)
        self.assertEqual(self.create_native().status_code, 403)

    def test_native_source_constraint(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Record.objects.create(
                patient=self.patient,
                author=self.b,
                external_id="forged",
                occurred_at=timezone.now(),
                summary="Inválido",
            )
