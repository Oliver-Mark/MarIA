import uuid
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q


class Clinic(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=160)


class Membership(models.Model):
    class Role(models.TextChoices):
        DOCTOR = "doctor", "Médico"
        RECEPTION = "reception", "Recepção"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    clinic = models.ForeignKey(Clinic, on_delete=models.PROTECT)
    role = models.CharField(max_length=16, choices=Role.choices)
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "clinic"], name="unique_membership"
            ),
            models.CheckConstraint(
                condition=Q(role__in=["doctor", "reception"]),
                name="valid_membership_role",
            ),
        ]


class AccountProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    phone = models.CharField(max_length=30, blank=True)


class DoctorProfile(models.Model):
    """Identidade profissional independente dos vínculos com clínicas."""

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    active = models.BooleanField(default=True)
    specialty = models.CharField(max_length=120, blank=True)
    registration_number = models.CharField(max_length=30, blank=True)
    registration_state = models.CharField(max_length=2, blank=True)


class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    name = models.CharField(max_length=160)
    birth_date = models.DateField()


class PatientLink(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT)
    clinic = models.ForeignKey(Clinic, on_delete=models.PROTECT)
    external_id = models.CharField(max_length=100)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "external_id"], name="unique_local_patient"
            ),
            models.UniqueConstraint(
                fields=["clinic", "patient"], name="unique_patient_clinic"
            ),
        ]


class Integration(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    clinic = models.ForeignKey(Clinic, on_delete=models.PROTECT)
    name = models.CharField(max_length=100)
    key_hash = models.CharField(max_length=128)
    active = models.BooleanField(default=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["clinic", "name"], name="unique_integration_name"
            ),
        ]


class Record(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    integration = models.ForeignKey(
        Integration, on_delete=models.PROTECT, null=True, blank=True
    )
    source_clinic = models.ForeignKey(
        Clinic, on_delete=models.PROTECT, null=True, blank=True
    )
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    external_id = models.CharField(max_length=100, blank=True, default="")
    occurred_at = models.DateTimeField()
    summary = models.TextField(max_length=10000)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(integration__isnull=True, external_id="")
                | (
                    Q(integration__isnull=False, source_clinic__isnull=True)
                    & ~Q(external_id="")
                ),
                name="record_source_context",
            ),
            models.UniqueConstraint(
                fields=["integration", "external_id"], name="unique_source_record"
            ),
            models.CheckConstraint(
                condition=Q(occurred_at__lte=models.F("received_at")),
                name="record_chronological",
            ),
        ]
        indexes = [
            models.Index(fields=["patient", "-occurred_at"], name="record_patient_time")
        ]

    @property
    def clinic_id(self):
        return (
            self.integration.clinic_id if self.integration_id else self.source_clinic_id
        )

    @property
    def clinic_name(self):
        if self.integration_id:
            return self.integration.clinic.name
        return self.source_clinic.name if self.source_clinic_id else None

    def clean(self):
        super().clean()
        if not self.integration_id:
            if self.patient_id and self.author_id == self.patient.user_id and not self.source_clinic_id:
                return
            if (
                self.author_id
                and not DoctorProfile.objects.filter(
                    user_id=self.author_id, active=True, user__is_active=True
                ).exists()
            ):
                raise ValidationError({"author": "Profissional não habilitado no HUB."})
            if (
                self.source_clinic_id
                and not Membership.objects.filter(
                    user_id=self.author_id,
                    clinic_id=self.source_clinic_id,
                    role=Membership.Role.DOCTOR,
                    active=True,
                ).exists()
            ):
                raise ValidationError(
                    {"source_clinic": "Autor sem vínculo assistencial nesta clínica."}
                )
            return
        clinic_id = self.integration.clinic_id
        if (
            self.author_id
            and not Membership.objects.filter(
                user_id=self.author_id,
                clinic_id=clinic_id,
                role=Membership.Role.DOCTOR,
                active=True,
            ).exists()
        ):
            raise ValidationError(
                {"author": "Autor deve ter vínculo assistencial na clínica de origem."}
            )
        if (
            self.patient_id
            and not PatientLink.objects.filter(
                patient_id=self.patient_id, clinic_id=clinic_id
            ).exists()
        ):
            raise ValidationError(
                {"patient": "Paciente deve estar vinculado à clínica de origem."}
            )


class Grant(models.Model):
    class Audience(models.TextChoices):
        CLINIC = "clinic", "Equipe da clínica"
        DOCTOR = "doctor", "Profissional solicitante"

    class Status(models.TextChoices):
        PENDING = "pending", "Pendente"
        APPROVED = "approved", "Autorizada"
        DENIED = "denied", "Recusada"
        REVOKED = "revoked", "Revogada"

    class Scope(models.TextChoices):
        PRIOR_RECORDS = "prior_records", "Registros anteriores disponíveis no aceite"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT)
    clinic = models.ForeignKey(Clinic, on_delete=models.PROTECT, null=True, blank=True)
    audience = models.CharField(
        max_length=12, choices=Audience.choices, default=Audience.CLINIC
    )
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    purpose = models.CharField(max_length=300)
    scope = models.CharField(
        max_length=30, default=Scope.PRIOR_RECORDS, choices=Scope.choices
    )
    status = models.CharField(
        max_length=12, default=Status.PENDING, choices=Status.choices
    )
    requested_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True)
    term_version = models.CharField(max_length=30, blank=True)
    term_text = models.TextField(blank=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=Q(audience="clinic", clinic__isnull=False)
                | Q(audience="doctor", clinic__isnull=True),
                name="grant_audience_context",
            ),
            models.CheckConstraint(
                condition=Q(expires_at__gt=models.F("requested_at")),
                name="grant_positive_period",
            ),
            models.CheckConstraint(
                condition=Q(scope="prior_records"), name="grant_supported_scope"
            ),
            models.CheckConstraint(
                condition=(
                    Q(
                        status__in=["pending", "denied"],
                        approved_at__isnull=True,
                        revoked_at__isnull=True,
                    )
                    | Q(
                        status="approved",
                        approved_at__isnull=False,
                        revoked_at__isnull=True,
                    )
                    | Q(
                        status="revoked",
                        approved_at__isnull=False,
                        revoked_at__isnull=False,
                    )
                ),
                name="grant_consistent_state",
            ),
            models.CheckConstraint(
                condition=Q(approved_at__isnull=True)
                | (
                    Q(approved_at__gte=models.F("requested_at"))
                    & Q(approved_at__lt=models.F("expires_at"))
                ),
                name="grant_approval_period",
            ),
            models.CheckConstraint(
                condition=Q(revoked_at__isnull=True)
                | Q(revoked_at__gte=models.F("approved_at")),
                name="grant_revocation_order",
            ),
            models.CheckConstraint(
                condition=Q(approved_at__isnull=True)
                | (~Q(term_text="") & ~Q(term_version="")),
                name="grant_approval_has_term",
            ),
        ]
        indexes = [
            models.Index(
                fields=["patient", "requester", "audience", "status", "expires_at"],
                name="grant_doctor_lookup",
            ),
            models.Index(
                fields=["patient", "clinic", "status", "expires_at"],
                name="grant_access_lookup",
            ),
        ]

    def clean(self):
        super().clean()
        if self.audience == self.Audience.DOCTOR:
            if (
                self.requester_id
                and not DoctorProfile.objects.filter(
                    user_id=self.requester_id, active=True, user__is_active=True
                ).exists()
            ):
                raise ValidationError(
                    {"requester": "Profissional não habilitado no HUB."}
                )
            return
        if (
            self.requester_id
            and self.clinic_id
            and not Membership.objects.filter(
                user_id=self.requester_id,
                clinic_id=self.clinic_id,
                role=Membership.Role.DOCTOR,
                active=True,
            ).exists()
        ):
            raise ValidationError(
                {"requester": "Solicitante deve ter vínculo assistencial na clínica."}
            )
        if (
            self.patient_id
            and self.clinic_id
            and not PatientLink.objects.filter(
                patient_id=self.patient_id, clinic_id=self.clinic_id
            ).exists()
        ):
            raise ValidationError(
                {"patient": "Paciente deve estar vinculado à clínica destinatária."}
            )


class AuditQuerySet(models.QuerySet):
    def update(self, **kwargs):
        raise TypeError("Eventos de auditoria não podem ser alterados pelo ORM.")

    def delete(self):
        raise TypeError("Eventos de auditoria não podem ser excluídos pelo ORM.")


class Audit(models.Model):
    objects = AuditQuerySet.as_manager()
    created_at = models.DateTimeField(auto_now_add=True)
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT)
    clinic = models.ForeignKey(Clinic, on_delete=models.PROTECT, null=True)
    patient = models.ForeignKey(Patient, on_delete=models.PROTECT, null=True)
    action = models.CharField(max_length=40)
    allowed = models.BooleanField()
    record_ids = models.JSONField(default=list)

    class Meta:
        indexes = [
            models.Index(fields=["patient", "-created_at"], name="audit_patient_time")
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            raise TypeError("Eventos de auditoria não podem ser alterados pelo ORM.")
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise TypeError("Eventos de auditoria não podem ser excluídos pelo ORM.")


class Attachment(models.Model):
    """Documento privado; o conteúdo nunca é incluído nos serializers de histórico."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    record = models.ForeignKey(Record, related_name="attachments", on_delete=models.PROTECT)
    filename = models.CharField(max_length=200)
    content_type = models.CharField(max_length=50)
    size = models.PositiveIntegerField()
    data = models.BinaryField()

    class Meta:
        constraints = [
            models.CheckConstraint(condition=Q(size__gt=0, size__lte=10485760), name="attachment_size_limit"),
            models.UniqueConstraint(fields=["record"], name="one_attachment_per_record"),
        ]
