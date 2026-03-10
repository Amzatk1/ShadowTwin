from django.urls import path

from .views import ApprovalDecisionView, ApprovalQueueView

urlpatterns = [
    path("<slug:workspace_slug>/", ApprovalQueueView.as_view(), name="approval-queue"),
    path("requests/<int:approval_id>/decision/", ApprovalDecisionView.as_view(), name="approval-decision"),
]
