"""Anexos privados do protótipo, armazenados atomicamente no PostgreSQL."""

from io import BytesIO
from pathlib import PurePath

from django.db import transaction
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied, ValidationError

from ..models import Attachment, Audit
from ..permissions import require_professional
from ..selectors import professional_grants_for_update

MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024


def validate_attachment(upload):
    if upload.size > MAX_ATTACHMENT_BYTES:
        raise ValidationError("O arquivo deve ter no máximo 10 MB.")
    header = upload.read(12)
    upload.seek(0)
    formats = (
        (b"%PDF-", ".pdf", "application/pdf"),
        (b"\xff\xd8\xff", ".jpg", "image/jpeg"),
        (b"\x89PNG\r\n\x1a\n", ".png", "image/png"),
    )
    suffix = PurePath(upload.name).suffix.lower()
    for signature, extension, content_type in formats:
        if header.startswith(signature) and suffix in (
            (".jpg", ".jpeg") if extension == ".jpg" else (extension,)
        ):
            upload.content_type = content_type
            return upload
    raise ValidationError("Envie um PDF, JPG ou PNG com formato e extensão compatíveis.")


def attach_file(record, upload):
    if upload:
        Attachment.objects.create(
            record=record, filename=upload.name[:200],
            content_type=upload.content_type, size=upload.size, data=upload.read(),
        )


def authorized_attachment(*, actor, attachment_id, original=False):
    attachment = get_object_or_404(
        Attachment.objects.select_related("record__patient").defer("data"), pk=attachment_id
    )
    record = attachment.record
    with transaction.atomic():
        allowed = record.patient.user_id == actor.pk
        if not original and not allowed:
            require_professional(actor)
            allowed = record.author_id == actor.pk
            if not allowed:
                grants = professional_grants_for_update(record.patient, actor, timezone.now())
                allowed = any(
                    record.occurred_at <= grant.approved_at
                    and record.received_at <= grant.approved_at for grant in grants
                )
        Audit.objects.create(
            actor=actor, patient=record.patient, action="attachment_download" if original else "attachment_view",
            allowed=allowed, record_ids=[str(record.pk)],
        )
    if not allowed:
        raise PermissionDenied("Sem autorização vigente para este documento.")
    return attachment


def download_attachment(*, actor, attachment_id):
    attachment = authorized_attachment(actor=actor, attachment_id=attachment_id, original=True)
    response = FileResponse(
        BytesIO(bytes(attachment.data)), as_attachment=True,
        filename=attachment.filename, content_type=attachment.content_type,
    )
    response["Cache-Control"] = "no-store, private"
    response["X-Content-Type-Options"] = "nosniff"
    return response
