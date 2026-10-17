"""Páginas rasterizadas: o visualizador médico não recebe o arquivo original."""

from io import BytesIO
from functools import wraps
from threading import RLock
import math

import pypdfium2 as pdfium
from PIL import Image, ImageDraw, UnidentifiedImageError
from django.http import HttpResponse
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from .attachments import authorized_attachment

MAX_PAGES = 100
MAX_SIDE = 1800
_RENDER_LOCK = RLock()


def serialized_render(function):
    """PDFium exige que operações nativas não ocorram simultaneamente em threads."""
    @wraps(function)
    def wrapped(*args, **kwargs):
        with _RENDER_LOCK:
            return function(*args, **kwargs)
    return wrapped


def _pdf(data):
    try:
        document = pdfium.PdfDocument(data)
        if not 0 < len(document) <= MAX_PAGES:
            document.close()
            raise ValidationError("O visualizador aceita PDFs com até 100 páginas.")
        return document
    except pdfium.PdfiumError as error:
        raise ValidationError("PDF inválido ou protegido; não foi possível abri-lo.") from error


@serialized_render
def preview_info(*, actor, attachment_id):
    attachment = authorized_attachment(actor=actor, attachment_id=attachment_id)
    pages = 1
    if attachment.content_type == "application/pdf":
        document = _pdf(bytes(attachment.data))
        try:
            pages = len(document)
        finally:
            document.close()
    return {"filename": attachment.filename, "pages": pages}


@serialized_render
def preview_page(*, actor, attachment_id, page_number):
    attachment = authorized_attachment(actor=actor, attachment_id=attachment_id)
    data = bytes(attachment.data)
    if attachment.content_type == "application/pdf":
        document = _pdf(data)
        try:
            if not 1 <= page_number <= len(document):
                raise ValidationError("Página inexistente.")
            page = document[page_number - 1]
            try:
                width, height = page.get_size()
                if not all(math.isfinite(size) and size > 0 for size in (width, height)):
                    raise ValidationError("Dimensões de página inválidas.")
                bitmap = page.render(scale=min(1.5, MAX_SIDE / max(width, height)))
                try:
                    image = bitmap.to_pil().convert("RGB")
                finally:
                    bitmap.close()
            finally:
                page.close()
        finally:
            document.close()
    else:
        if page_number != 1:
            raise ValidationError("Página inexistente.")
        try:
            with Image.open(BytesIO(data)) as source:
                source.thumbnail((MAX_SIDE, MAX_SIDE))
                image = source.convert("RGB")
        except (UnidentifiedImageError, OSError, Image.DecompressionBombError) as error:
            raise ValidationError("Imagem inválida ou grande demais para visualização.") from error
    # Marca de identificação; não impede captura de tela ou cópia da imagem.
    draw = ImageDraw.Draw(image, "RGBA")
    watermark = f"MarIA | {actor.username} | {timezone.localtime():%d/%m/%Y %H:%M}"
    for top in range(25, image.height, 250):
        draw.text((20, top), watermark, fill=(50, 80, 105, 110))
    output = BytesIO()
    image.save(output, format="PNG")
    image.close()
    response = HttpResponse(output.getvalue(), content_type="image/png")
    response["Cache-Control"] = "no-store, private"
    response["X-Content-Type-Options"] = "nosniff"
    response["Content-Disposition"] = "inline"
    return response
