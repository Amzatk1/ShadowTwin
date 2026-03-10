from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.workspaces.models import Membership, Workspace

from .models import ApprovalRequest
from .serializers import ApprovalDecisionSerializer, ApprovalQueueSerializer

DECISION_TO_STATUS = {
    "approve": "approved",
    "reject": "rejected",
    "snooze": "snoozed",
    "edit": "edited",
}


class ApprovalQueueView(APIView):
    def get(self, request, workspace_slug: str):
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        approvals = ApprovalRequest.objects.filter(workspace=workspace).order_by("-created_at")
        serializer = ApprovalQueueSerializer(
            {
                "items": [
                    {
                        "id": str(item.id),
                        "proposedAction": item.proposed_action,
                        "whySuggested": item.why_suggested,
                        "confidence": float(item.confidence),
                        "status": item.status,
                        "sourceLabel": item.source_label,
                        "dueLabel": item.due_label,
                    }
                    for item in approvals
                ]
            }
        )
        return Response(serializer.data)


class ApprovalDecisionView(APIView):
    def post(self, request, approval_id: str):
        serializer = ApprovalDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approval = get_object_or_404(ApprovalRequest, pk=approval_id)
        get_object_or_404(Membership, workspace=approval.workspace, user=request.user)
        decision = serializer.validated_data["decision"]
        approval.status = DECISION_TO_STATUS[decision]
        if decision == "snooze":
            approval.snoozed_until = timezone.now() + timedelta(hours=4)
        approval.save(update_fields=["status", "snoozed_until"])
        AuditEvent.objects.create(
            workspace=approval.workspace,
            actor=request.user if request.user.is_authenticated else None,
            action_type=f"approval.{decision}",
            object_type="approval_request",
            object_id=str(approval.id),
            metadata={
                "note": serializer.validated_data.get("note", ""),
                "proposed_action": approval.proposed_action,
            },
        )
        return Response(
            {
                "approvalId": str(approval.id),
                "status": approval.status,
                "note": serializer.validated_data.get("note", ""),
            }
        )
