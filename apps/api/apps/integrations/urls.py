from django.urls import path

from .views import (
    GoogleCallbackView,
    GoogleConnectView,
    IntegrationListView,
    IntegrationModeView,
    IntegrationSyncView,
    IntegrationScopesView,
)

urlpatterns = [
    path("", IntegrationListView.as_view(), name="integration-list"),
    path("google/connect/", GoogleConnectView.as_view(), name="google-connect"),
    path("google/callback/", GoogleCallbackView.as_view(), name="google-callback"),
    path("<str:connection_id>/mode/", IntegrationModeView.as_view(), name="integration-mode"),
    path("<str:connection_id>/scopes/", IntegrationScopesView.as_view(), name="integration-scopes"),
    path("<str:connection_id>/sync/", IntegrationSyncView.as_view(), name="integration-sync"),
]
