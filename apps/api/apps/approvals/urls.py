from django.urls import path

from .views import ApprovalDecisionView

urlpatterns = [
    path("<uuid:approval_id>/decision/", ApprovalDecisionView.as_view(), name="approval-decision"),
]

