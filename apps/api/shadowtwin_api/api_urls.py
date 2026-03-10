from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.authn.urls")),
    path("today/", include("apps.workspaces.urls")),
    path("feed/", include("apps.recommendations.urls")),
    path("approvals/", include("apps.approvals.urls")),
]

