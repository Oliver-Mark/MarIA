from datetime import timedelta
from io import BytesIO
import pypdfium2 as pdfium
from PIL import Image

from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone

from ..models import Attachment, Audit, DoctorProfile, Grant, Record
from .test_flows import HubTestCase


class DocumentTests(HubTestCase):
    def setUp(self):
        super().setUp()
        DoctorProfile.objects.create(user=self.a)
        DoctorProfile.objects.create(user=self.b)

    def upload(self, actor=None, url="/api/v1/patient/records/", content=None, name="exame.pdf"):
        if content is None:
            document = pdfium.PdfDocument.new()
            page = document.new_page(400, 600)
            page.close()
            output = BytesIO()
            document.save(output)
            document.close()
            content = output.getvalue()
        self.client.force_authenticate(actor or self.p)
        return self.client.post(url, {
            "occurred_at": (timezone.now() - timedelta(minutes=1)).isoformat(),
            "summary": "Documento fictício de teste",
            "attachment": SimpleUploadedFile(name, content, content_type="application/pdf"),
        }, format="multipart")

    def approve(self):
        self.client.force_authenticate(self.b)
        response = self.client.post("/api/v1/doctor/grants/", {
            "patient_id": str(self.patient.pk), "purpose": "Consulta", "duration_days": 10,
        }, format="json")
        grant_id = response.data["id"]
        self.client.force_authenticate(self.p)
        self.client.post(f"/api/v1/patient/grants/{grant_id}/decision/", {
            "decision": "approve", "term_version": "doctor-1",
        }, format="json")
        return grant_id

    def test_patient_owns_history_and_private_download(self):
        response = self.upload()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["patient_reported"])
        attachment = response.data["attachments"][0]
        self.assertNotIn("data", attachment)
        url = f'/api/v1/attachments/{attachment["id"]}/download/'
        download = self.client.get(url)
        self.assertEqual(download.status_code, 200)
        self.assertEqual(b"".join(download.streaming_content), bytes(Attachment.objects.get().data))
        self.assertEqual(download["Cache-Control"], "no-store, private")
        self.assertIn("attachment;", download["Content-Disposition"])
        self.assertEqual(len(self.client.get("/api/v1/patient/records/").data["records"]), 1)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(url).status_code, 403)
        self.assertEqual(self.client.get("/api/v1/patient/records/").data["records"], [])
        self.client.force_authenticate(None)
        self.assertEqual(self.client.get(url).status_code, 401)

    def test_shared_preview_respects_revocation_and_snapshot(self):
        first = self.upload().data["attachments"][0]["id"]
        grant_id = self.approve()
        later = self.upload().data["attachments"][0]["id"]
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(f"/api/v1/attachments/{first}/preview/").status_code, 200)
        self.assertEqual(self.client.get(f"/api/v1/attachments/{later}/preview/").status_code, 403)
        self.client.force_authenticate(self.p)
        self.client.post(f"/api/v1/patient/grants/{grant_id}/decision/", {"decision": "revoke"}, format="json")
        self.client.force_authenticate(self.b)
        self.assertEqual(self.client.get(f"/api/v1/attachments/{first}/preview/").status_code, 403)
        self.assertTrue(Audit.objects.filter(action="attachment_view", allowed=False).exists())

    def test_doctor_upload_requires_grant_but_authorship_persists(self):
        url = f"/api/v1/doctor/patients/{self.patient.pk}/records/"
        self.assertEqual(self.upload(self.b, url).status_code, 403)
        self.assertEqual(Attachment.objects.count(), 0)
        grant_id = self.approve()
        response = self.upload(self.b, url)
        self.assertEqual(response.status_code, 201)
        self.assertFalse(response.data["patient_reported"])
        attachment_id = response.data["attachments"][0]["id"]
        self.client.force_authenticate(self.p)
        self.assertEqual(len(self.client.get("/api/v1/patient/records/").data["records"]), 1)
        self.client.post(f"/api/v1/patient/grants/{grant_id}/decision/", {"decision": "revoke"}, format="json")
        self.client.force_authenticate(self.b)
        download_url = f"/api/v1/attachments/{attachment_id}/download/"
        self.assertEqual(self.client.get(download_url).status_code, 403)
        preview_url = f"/api/v1/attachments/{attachment_id}/preview/"
        self.assertEqual(self.client.get(preview_url).status_code, 200)
        DoctorProfile.objects.filter(user=self.b).update(active=False)
        self.assertEqual(self.client.get(preview_url).status_code, 403)

    def test_invalid_and_oversize_files_do_not_create_records(self):
        for content, name in [(b"<script>alert(1)</script>", "exame.pdf"),
                              (b"%PDF-1.4", "exame.html"),
                              (b"%PDF-" + b"x" * (10 * 1024 * 1024), "grande.pdf")]:
            self.assertEqual(self.upload(content=content, name=name).status_code, 400)
        self.assertEqual(Record.objects.count(), 0)
        self.assertEqual(Attachment.objects.count(), 0)

    def test_patient_endpoint_rejects_doctor_and_cannot_target_another_patient(self):
        self.assertEqual(self.upload(self.b).status_code, 404)
        self.client.force_authenticate(self.p)
        response = self.client.post("/api/v1/patient/records/", {
            "patient_id": str(self.other.patient.pk),
            "occurred_at": timezone.now().isoformat(), "summary": "Meu relato",
        }, format="json")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Record.objects.get().patient_id, self.patient.pk)


    def test_doctor_receives_only_rasterized_pages_and_cannot_download_original(self):
        attachment_id = self.upload().data["attachments"][0]["id"]
        self.approve()
        self.client.force_authenticate(self.b)
        base = f"/api/v1/attachments/{attachment_id}"
        self.assertEqual(self.client.get(base + "/download/").status_code, 403)
        info = self.client.get(base + "/preview/")
        self.assertEqual(info.status_code, 200)
        self.assertEqual(info.data["pages"], 1)
        page = self.client.get(base + "/pages/1/")
        self.assertEqual(page.status_code, 200)
        self.assertEqual(page["Content-Type"], "image/png")
        self.assertEqual(page["Cache-Control"], "no-store, private")
        image = Image.open(BytesIO(page.content))
        self.assertGreater(image.width, 0)
        self.assertLessEqual(max(image.size), 1800)
        self.assertEqual(self.client.get(base + "/pages/2/").status_code, 400)
        self.client.force_authenticate(self.other)
        self.assertEqual(self.client.get(base + "/pages/1/").status_code, 403)

    def test_corrupt_preview_fails_without_returning_original(self):
        attachment_id = self.upload(content=b"%PDF-not-valid").data["attachments"][0]["id"]
        self.assertEqual(self.client.get(f"/api/v1/attachments/{attachment_id}/preview/").status_code, 400)
