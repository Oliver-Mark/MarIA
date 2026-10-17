from rest_framework import serializers
from .constants import GrantDecision, PERSONAL_GRANT_DURATIONS
from .models import Attachment, Grant, Record
from .services.attachments import validate_attachment


class RecordInput(serializers.Serializer):
    external_patient_id = serializers.CharField(max_length=100)
    external_id = serializers.CharField(max_length=100)
    occurred_at = serializers.DateTimeField()
    summary = serializers.CharField(max_length=10000)


class AttachmentOutput(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = ["id", "filename", "content_type", "size"]


class RecordOutput(serializers.ModelSerializer):
    attachments = AttachmentOutput(many=True, read_only=True)
    patient_reported = serializers.SerializerMethodField()

    def get_patient_reported(self, record):
        return record.author_id == record.patient.user_id

    clinic_id = serializers.UUIDField(read_only=True, allow_null=True)
    clinic_name = serializers.CharField(read_only=True, allow_null=True)
    author_name = serializers.CharField(source="author.get_full_name")

    class Meta:
        model = Record
        fields = [
            "id",
            "patient_id",
            "clinic_id",
            "clinic_name",
            "author_id",
            "author_name",
            "occurred_at",
            "summary",
            "received_at",
            "attachments",
            "patient_reported",
        ]


class PatientRecordInput(serializers.Serializer):
    occurred_at = serializers.DateTimeField()
    summary = serializers.CharField(max_length=10000)
    attachment = serializers.FileField(required=False, validators=[validate_attachment])

    def validate_occurred_at(self, value):
        from django.utils import timezone
        if value > timezone.now():
            raise serializers.ValidationError("Data não pode estar no futuro.")
        return value


class ProfessionalRecordInput(PatientRecordInput):
    clinic_id = serializers.UUIDField(required=False, allow_null=True)

class GrantInput(serializers.Serializer):
    patient_id = serializers.UUIDField()
    purpose = serializers.CharField(max_length=300)
    expires_at = serializers.DateTimeField()


class ProfessionalGrantInput(serializers.Serializer):
    patient_id = serializers.UUIDField()
    purpose = serializers.CharField(max_length=300)
    duration_days = serializers.ChoiceField(choices=PERSONAL_GRANT_DURATIONS)


class GrantOutput(serializers.ModelSerializer):
    requester_name = serializers.CharField(source="requester.get_full_name")
    patient_name = serializers.CharField(source="patient.name")
    clinic_name = serializers.CharField(
        source="clinic.name", allow_null=True, default=None
    )

    class Meta:
        model = Grant
        fields = [
            "id",
            "patient_id",
            "clinic_id",
            "clinic_name",
            "requester_id",
            "requester_name",
            "patient_name",
            "audience",
            "purpose",
            "scope",
            "status",
            "requested_at",
            "approved_at",
            "expires_at",
            "revoked_at",
            "term_version",
            "term_text",
        ]


class DecisionInput(serializers.Serializer):
    decision = serializers.ChoiceField(choices=GrantDecision.choices)
    term_version = serializers.CharField(required=False)


class ProfileInput(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=False)
    email = serializers.EmailField(max_length=254, required=False, allow_blank=True)
    phone = serializers.RegexField(r"^[0-9+() .-]*$", max_length=30, required=False, allow_blank=True)
    birth_date = serializers.DateField(required=False)
    specialty = serializers.CharField(max_length=120, required=False, allow_blank=True)
    registration_number = serializers.RegexField(r"^[0-9]*$", max_length=30, required=False, allow_blank=True)
    registration_state = serializers.ChoiceField(
        choices=[""] + "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(),
        required=False,
    )

    def validate_birth_date(self, value):
        from django.utils import timezone
        if value > timezone.localdate():
            raise serializers.ValidationError("A data de nascimento não pode estar no futuro.")
        return value

    def validate(self, attrs):
        extra = set(self.initial_data) - set(self.fields)
        if extra:
            raise serializers.ValidationError("Somente os campos editáveis do perfil são aceitos.")
        return attrs
