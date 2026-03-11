from django.urls import path

from .views import TodayDashboardView, WorkspaceOnboardingView

urlpatterns = [
    path("<slug:workspace_slug>/", TodayDashboardView.as_view(), name="today-dashboard"),
    path("setup/", WorkspaceOnboardingView.as_view(), name="workspace-setup"),
]
