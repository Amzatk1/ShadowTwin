from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.approvals.models import ApprovalRequest
from apps.email_intelligence.models import EmailThread
from apps.integrations.models import IntegrationConnection
from apps.meetings.models import Meeting
from apps.recommendations.models import Insight, Recommendation

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
        recommendations = list(
            Recommendation.objects.filter(workspace=workspace)
            .exclude(status="dismissed")
            .order_by("-pinned_at", "-created_at")[:5]
        )
        meetings = list(Meeting.objects.filter(workspace=workspace).order_by("starts_at")[:3])
        insights = list(Insight.objects.filter(workspace=workspace).order_by("-created_at")[:3])
        connection_count = IntegrationConnection.objects.filter(workspace=workspace, is_enabled=True).count()
        reply_risk_count = EmailThread.objects.filter(workspace=workspace, needs_reply=True).count()
        priorities = [item.title for item in recommendations[:3]]
        priorities.extend(
            [
                f"Meeting brief ready for {meeting.title}"
                for meeting in meetings[:1]
            ]
        )
        payload = {
            "metrics": [
                {"label": "Connected sources", "value": str(connection_count), "delta": "Google-first observe mode"},
                {"label": "Meetings prepped", "value": str(len(meetings)), "delta": "Read-only brief generation"},
                {"label": "Reply risks", "value": str(reply_risk_count), "delta": "Flagged from inbox patterns"},
                {"label": "Twin confidence", "value": "84%", "delta": "Signals grounded in source traces"},
            ],
            "priorities": priorities,
            "actionQueue": (
                [
                    {
                        "id": str(approval.id),
                        "title": approval.proposed_action,
                        "description": approval.why_suggested,
                        "status": APPROVAL_TO_ACTION_STATUS.get(approval.status, "attention"),
                        "source": approval.source_label,
                        "dueLabel": approval.due_label,
                    }
                    for approval in approvals
                ]
                if approvals
                else [
                    {
                        "id": str(item.id),
                        "title": item.title,
                        "description": item.detail,
                        "status": "attention",
                        "source": "ShadowTwin",
                        "dueLabel": f"{item.risk_level} risk",
                    }
                    for item in recommendations[:3]
                ]
            ),
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
