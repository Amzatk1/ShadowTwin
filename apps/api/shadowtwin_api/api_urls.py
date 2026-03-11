from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.authn.urls")),
    path("today/", include("apps.workspaces.urls")),
    path("email/", include("apps.email_intelligence.urls")),
    path("feed/", include("apps.recommendations.urls")),
    path("meetings/", include("apps.meetings.urls")),
    path("approvals/", include("apps.approvals.urls")),
    path("integrations/", include("apps.integrations.urls")),
    path("privacy/", include("apps.privacy.urls")),
    path("memory/", include("apps.memory.urls")),
    path("notifications/", include("apps.notifications.urls")),
    path("audit/", include("apps.audit.urls")),
]
