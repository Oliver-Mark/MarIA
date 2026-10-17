"""Endpoints HTTP: validam entrada e delegam regras aos serviços."""

from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .constants import LIST_LIMIT, PERSONAL_GRANT_DURATIONS
from .permissions import require_doctor, require_patient_account, require_professional
from .selectors import (
    local_patients,
    patient_grants,
    user_context,
    professional_patients,
    professional_grants,
)
from .serializers import (
    DecisionInput,
    GrantInput,
    GrantOutput,
    RecordInput,
    RecordOutput,
    ProfessionalRecordInput,
    PatientRecordInput,
    ProfessionalGrantInput,
    ProfileInput,
)
from .services.grants import decide_access, request_access, request_professional_access
from .services.records import ingest_record, read_history, read_professional_history
from .services.records import (
    create_professional_record, read_authored_records,
    read_patient_history, create_patient_record,
)
from .services.attachments import download_attachment


def demo(request):
    return render(request, "hub-demo.html")


@api_view(["GET"])
def me(request):
    return Response(user_context(request.user))


@api_view(["GET"])
def patients(request, clinic_id):
    clinic = require_doctor(request.user, clinic_id)
    return Response(
        [
            {
                "id": str(link.patient_id),
                "name": link.patient.name,
                "external_id": link.external_id,
            }
            for link in local_patients(clinic)
        ]
    )


@api_view(["POST"])
def ingest(request):
    serializer = RecordInput(data=request.data)
    serializer.is_valid(raise_exception=True)
    record, created = ingest_record(
        actor=request.user,
        integration_key=request.headers.get("X-Integration-Key", ""),
        data=serializer.validated_data,
    )
    response_status = status.HTTP_201_CREATED if created else status.HTTP_200_OK
    return Response(RecordOutput(record).data, status=response_status)


@api_view(["POST"])
def request_grant(request, clinic_id):
    serializer = GrantInput(data=request.data)
    serializer.is_valid(raise_exception=True)
    grant = request_access(
        actor=request.user, clinic_id=clinic_id, data=serializer.validated_data
    )
    return Response(GrantOutput(grant).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def my_grants(request):
    patient = require_patient_account(request.user)
    return Response(GrantOutput(patient_grants(patient), many=True).data)


@api_view(["POST"])
def decide(request, grant_id):
    serializer = DecisionInput(data=request.data)
    serializer.is_valid(raise_exception=True)
    grant = decide_access(
        actor=request.user, grant_id=grant_id, **serializer.validated_data
    )
    return Response(GrantOutput(grant).data)


@api_view(["GET"])
def history(request, clinic_id, patient_id):
    result = read_history(
        actor=request.user, clinic_id=clinic_id, patient_id=patient_id
    )
    return Response(
        {
            "records": RecordOutput(result.records, many=True).data,
            "limit": LIST_LIMIT,
            "external_access": result.external_access,
        }
    )


def hub(request):
    return render(request, "hub.html", {
        "grant_durations": PERSONAL_GRANT_DURATIONS,
        "profile_states": [state for state in ProfileInput().fields["registration_state"].choices if state],
    })


def hub_login(request):
    return render(request, "hub-login.html")


@api_view(["GET"])
def doctor_patients(request):

    require_professional(request.user)
    return Response(
        [{"id": str(p.pk), "name": p.name} for p in professional_patients(request.user)]
    )


@api_view(["GET", "POST"])
def doctor_grants(request):

    require_professional(request.user)
    if request.method == "GET":
        return Response(GrantOutput(professional_grants(request.user), many=True).data)
    serializer = ProfessionalGrantInput(data=request.data)
    serializer.is_valid(raise_exception=True)
    grant = request_professional_access(
        actor=request.user, data=serializer.validated_data
    )
    return Response(GrantOutput(grant).data, status=status.HTTP_201_CREATED)


@api_view(["GET"])
def doctor_history(request, patient_id):

    result = read_professional_history(actor=request.user, patient_id=patient_id)
    return Response(
        {
            "records": RecordOutput(result.records, many=True).data,
            "limit": LIST_LIMIT,
            "external_access": result.external_access,
        }
    )


@api_view(["GET", "POST"])
def doctor_records(request, patient_id):
    if request.method == "POST":
        serializer = ProfessionalRecordInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = create_professional_record(
            actor=request.user, patient_id=patient_id, data=serializer.validated_data
        )
        return Response(RecordOutput(record).data, status=status.HTTP_201_CREATED)
    result = read_authored_records(actor=request.user, patient_id=patient_id)
    return Response(
        {
            "records": RecordOutput(result.records, many=True).data,
            "limit": LIST_LIMIT,
            "external_access": False,
        }
    )


@api_view(["GET", "POST"])
def patient_records(request):
    if request.method == "POST":
        serializer = PatientRecordInput(data=request.data)
        serializer.is_valid(raise_exception=True)
        record = create_patient_record(actor=request.user, data=serializer.validated_data)
        return Response(RecordOutput(record).data, status=status.HTTP_201_CREATED)
    return Response({"records": RecordOutput(read_patient_history(actor=request.user), many=True).data,
                     "limit": LIST_LIMIT})


@api_view(["GET"])
def attachment_download(request, attachment_id):
    return download_attachment(actor=request.user, attachment_id=attachment_id)


@api_view(["GET"])
def attachment_preview(request, attachment_id):
    from .services.document_preview import preview_info
    return Response(preview_info(actor=request.user, attachment_id=attachment_id))


@api_view(["GET"])
def attachment_page(request, attachment_id, page_number):
    from .services.document_preview import preview_page
    return preview_page(actor=request.user, attachment_id=attachment_id, page_number=page_number)


@api_view(["GET", "PATCH"])
def account_profile(request):
    from .services.profiles import read_profile, update_profile
    if request.method == "GET":
        return Response(read_profile(request.user))
    serializer = ProfileInput(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response(update_profile(actor=request.user, data=serializer.validated_data))
