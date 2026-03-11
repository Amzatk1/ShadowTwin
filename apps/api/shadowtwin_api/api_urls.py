from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.authn.urls")),
    path("today/", include("apps.workspaces.urls")),
    path("feed/", include("apps.recommendations.urls")),
    path("approvals/", include("apps.approvals.urls")),
    path("integrations/", include("apps.integrations.urls")),
    path("privacy/", include("apps.privacy.urls")),
    path("memory/", include("apps.memory.urls")),
    path("audit/", include("apps.audit.urls")),
]
