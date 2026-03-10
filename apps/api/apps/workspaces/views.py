from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.approvals.models import ApprovalRequest
from apps.meetings.models import Meeting
from apps.recommendations.models import Insight

from .models import Membership, Workspace
from .serializers import TodaySerializer

APPROVAL_TO_ACTION_STATUS = {
    "pending": "approval",
    "approved": "ready",
    "rejected": "attention",
    "snoozed": "attention",
    "edited": "attention",
}


class TodayDashboardView(APIView):
    def get(self, request, workspace_slug: str):
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        approvals = list(
            ApprovalRequest.objects.filter(workspace=workspace).order_by("-created_at")[:3]
        )
        meetings = list(Meeting.objects.filter(workspace=workspace).order_by("starts_at")[:3])
        insights = list(Insight.objects.filter(workspace=workspace).order_by("-created_at")[:3])
        payload = {
            "metrics": [
                {"label": "Follow-ups prevented", "value": "12", "delta": "+3 this week"},
                {"label": "Meetings prepped", "value": str(len(meetings)), "delta": "Ready for today"},
                {"label": "Hours saved", "value": "7.4", "delta": "Projected this week"},
                {"label": "Draft acceptance", "value": "84%", "delta": "Style confidence rising"},
            ],
            "priorities": [
                "Investor follow-up window closes at 15:00",
                "Meeting brief ready for Daniel Moss at 14:30",
                "Three follow-ups may slip before 17:00",
            ],
            "actionQueue": [
                {
                    "id": str(approval.id),
                    "title": approval.proposed_action,
                    "description": approval.why_suggested,
                    "status": APPROVAL_TO_ACTION_STATUS.get(approval.status, "attention"),
                    "source": approval.source_label,
                    "dueLabel": approval.due_label,
                }
                for approval in approvals
            ],
            "meetings": [
                {
                    "id": str(meeting.id),
                    "title": meeting.title,
                    "startTime": meeting.starts_at.strftime("%H:%M"),
                    "participants": meeting.participants,
                    "priority": meeting.priority,
                    "summary": meeting.summary,
                }
                for meeting in meetings
            ],
            "insights": [
                {
                    "id": str(insight.id),
                    "title": insight.title,
                    "detail": insight.detail,
                    "confidence": float(insight.confidence),
                    "rationale": insight.rationale,
                    "createdAt": insight.created_at,
                }
                for insight in insights
            ],
        }
        serializer = TodaySerializer(payload)
        return Response(serializer.data)
