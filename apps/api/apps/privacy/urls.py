from django.urls import path

from .views import PrivacyExclusionView, PrivacyView

urlpatterns = [
    path("", PrivacyView.as_view(), name="privacy"),
    path("exclusions/", PrivacyExclusionView.as_view(), name="privacy-exclusions"),
]
