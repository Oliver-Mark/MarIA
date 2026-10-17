from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from hub import views

urlpatterns = [
    path("", views.hub_login),
    path("hub/login/", views.hub_login),
    path("hub/", views.hub),
    path("api/v1/doctor/patients/", views.doctor_patients),
    path("api/v1/doctor/grants/", views.doctor_grants),
    path("api/v1/doctor/patients/<uuid:patient_id>/history/", views.doctor_history),
    path("api/v1/doctor/patients/<uuid:patient_id>/records/", views.doctor_records),
    path("demo/", views.demo),
    path("api/v1/auth/login/", TokenObtainPairView.as_view()),
    path("api/v1/auth/refresh/", TokenRefreshView.as_view()),
    path("api/v1/me/", views.me),
    path("api/v1/me/profile/", views.account_profile),
    path("api/v1/integration/records/", views.ingest),
    path("api/v1/clinics/<uuid:clinic_id>/patients/", views.patients),
    path("api/v1/clinics/<uuid:clinic_id>/grants/", views.request_grant),
    path(
        "api/v1/clinics/<uuid:clinic_id>/patients/<uuid:patient_id>/history/",
        views.history,
    ),
    path("api/v1/patient/records/", views.patient_records),
    path("api/v1/attachments/<uuid:attachment_id>/download/", views.attachment_download),
    path("api/v1/attachments/<uuid:attachment_id>/preview/", views.attachment_preview),
    path("api/v1/attachments/<uuid:attachment_id>/pages/<int:page_number>/", views.attachment_page),
    path("api/v1/patient/grants/", views.my_grants),
    path("api/v1/patient/grants/<uuid:grant_id>/decision/", views.decide),
]
