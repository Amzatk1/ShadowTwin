from django.urls import path

from .views import TodayDashboardView

urlpatterns = [
    path("<slug:workspace_slug>/", TodayDashboardView.as_view(), name="today-dashboard"),
]

