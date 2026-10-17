from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction

from ..models import Audit, Grant, Membership, Record
from .test_flows import HubTestCase


class IntegrityTests(HubTestCase):
    """Casos que complementam o fluxo usando a mesma massa fictícia."""

    def test_database_rejects_approved_without_timestamp(self):
        grant_id = self.request()
        with self.assertRaises(IntegrityError), transaction.atomic():
            Grant.objects.filter(pk=grant_id).update(status=Grant.Status.APPROVED)

    def test_database_rejects_unknown_role(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Membership.objects.filter(user=self.b).update(role="unknown")

    def test_database_rejects_unknown_scope(self):
        grant_id = self.request()
        with self.assertRaises(IntegrityError), transaction.atomic():
            Grant.objects.filter(pk=grant_id).update(scope="all_records")

    def test_model_validation_rejects_wrong_record_author(self):
        self.ingest()
        record = Record.objects.get()
        record.author = self.b
        with self.assertRaises(ValidationError):
            record.full_clean()

    def test_audit_cannot_be_updated_or_deleted_using_orm(self):
        self.ingest()
        event = Audit.objects.first()
        event.allowed = False
        with self.assertRaises(TypeError):
            event.save()
        with self.assertRaises(TypeError):
            Audit.objects.filter(pk=event.pk).update(allowed=False)
        with self.assertRaises(TypeError):
            event.delete()
        with self.assertRaises(TypeError):
            Audit.objects.filter(pk=event.pk).delete()

    def test_wrong_term_version_does_not_approve(self):
        grant_id = self.request()
        self.client.force_authenticate(self.p)
        response = self.client.post(
            f"/api/v1/patient/grants/{grant_id}/decision/",
            {"decision": "approve", "term_version": "other"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(Grant.objects.get(pk=grant_id).status, Grant.Status.PENDING)

    def test_denial_cannot_be_reversed_by_same_request(self):
        grant_id = self.request()
        self.assertEqual(self.decision(grant_id, "deny").status_code, 200)
        self.assertEqual(self.decision(grant_id, "approve").status_code, 409)

    def test_conflict_keeps_denied_audit(self):
        self.ingest()
        self.data["summary"] = "Conflicting payload"
        self.assertEqual(self.ingest().status_code, 409)
        self.assertTrue(
            Audit.objects.filter(action="ingest_conflict", allowed=False).exists()
        )

    def test_denied_history_keeps_audit(self):
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.history).status_code, 403)
        self.assertTrue(Audit.objects.filter(action="history", allowed=False).exists())

    def test_inactive_membership_denies_history(self):
        self.ingest()
        grant_id = self.request()
        self.decision(grant_id, "approve")
        Membership.objects.filter(user=self.b).update(active=False)
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(self.history).status_code, 403)
