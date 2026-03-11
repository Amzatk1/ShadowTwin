from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.approvals.models import ApprovalRequest
from apps.email_intelligence.models import EmailThread
from apps.integrations.models import IntegrationConnection
from apps.meetings.models import Meeting
from apps.recommendations.models import Insight, Recommendation
from apps.twins.models import TwinProfile

from .models import Membership, Workspace
from .onboarding_serializers import OnboardingSerializer, OnboardingUpdateSerializer
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
        twin = TwinProfile.objects.filter(workspace=workspace, owner=request.user).first()
        approvals = list(
            ApprovalRequest.objects.filter(workspace=workspace).order_by("-created_at")[:3]
        )
        recommendations = list(
            Recommendation.objects.filter(workspace=workspace)
            .exclude(status="dismissed")
            .order_by("-pinned_at", "-confidence", "-created_at")[:5]
        )
        meetings = list(Meeting.objects.filter(workspace=workspace).order_by("starts_at")[:3])
        insights = list(Insight.objects.filter(workspace=workspace).order_by("-created_at")[:3])
        connection_count = IntegrationConnection.objects.filter(workspace=workspace, is_enabled=True).count()
        reply_risk_count = EmailThread.objects.filter(workspace=workspace, needs_reply=True).count()
        sensitive_reply_risk_count = EmailThread.objects.filter(
            workspace=workspace, needs_reply=True, is_sensitive=True
        ).count()
        confidence_value = int(float(twin.confidence_score or 0) * 100) if twin else 0
        priorities = []
        if twin and twin.priorities_summary:
            priorities.append(twin.priorities_summary)
        priorities.extend([item.title for item in recommendations[:3]])
        priorities.extend(
            [
                f"Meeting brief ready for {meeting.title}"
                for meeting in meetings[:1]
            ]
        )
        payload = {
            "twinOverview": {
                "operatorRole": twin.operator_role if twin else "founder",
                "stage": twin.stage if twin else workspace.stage,
                "minimalModeEnabled": twin.minimal_mode_enabled if twin else True,
                "confidenceScore": float(twin.confidence_score) if twin else 0.0,
                "prioritiesSummary": twin.priorities_summary if twin and twin.priorities_summary else "ShadowTwin is still learning your operating rhythm from connected sources.",
                "goals": twin.goals if twin else [],
            },
            "metrics": [
                {"label": "Connected sources", "value": str(connection_count), "delta": "Provider-first observe mode is active"},
                {"label": "Meetings prepped", "value": str(len(meetings)), "delta": "Briefs are assembled without outbound automation"},
                {"label": "Reply risks", "value": str(reply_risk_count), "delta": f"{sensitive_reply_risk_count} high-context thread{'s' if sensitive_reply_risk_count != 1 else ''} in view"},
                {"label": "Twin confidence", "value": f"{confidence_value}%", "delta": twin.priorities_summary if twin and twin.priorities_summary else "Signals are grounded in source traces"},
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


class WorkspaceOnboardingView(APIView):
    def get(self, request):
        workspace_slug = request.query_params.get("workspaceSlug")
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        twin, _ = TwinProfile.objects.get_or_create(
            workspace=workspace,
            owner=request.user,
            defaults={"stage": workspace.stage},
        )
        payload = {
            "workspaceSlug": workspace.slug,
            "operatorRole": twin.operator_role,
            "goals": twin.goals,
            "minimalModeEnabled": twin.minimal_mode_enabled,
            "stage": twin.stage,
            "completedAt": twin.onboarding_completed_at,
        }
        return Response(OnboardingSerializer(payload).data)

    def patch(self, request):
        serializer = OnboardingUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = get_object_or_404(Workspace, slug=serializer.validated_data["workspaceSlug"])
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        twin, _ = TwinProfile.objects.get_or_create(
            workspace=workspace,
            owner=request.user,
            defaults={"stage": workspace.stage},
        )
        if "operatorRole" in serializer.validated_data:
            twin.operator_role = serializer.validated_data["operatorRole"]
        if "goals" in serializer.validated_data:
            twin.goals = serializer.validated_data["goals"]
        if "minimalModeEnabled" in serializer.validated_data:
            twin.minimal_mode_enabled = serializer.validated_data["minimalModeEnabled"]
        if "stage" in serializer.validated_data:
            twin.stage = serializer.validated_data["stage"]
            workspace.stage = serializer.validated_data["stage"]
            workspace.save(update_fields=["stage"])
        twin.onboarding_completed_at = timezone.now()
        twin.save()
        payload = {
            "workspaceSlug": workspace.slug,
            "operatorRole": twin.operator_role,
            "goals": twin.goals,
            "minimalModeEnabled": twin.minimal_mode_enabled,
            "stage": twin.stage,
            "completedAt": twin.onboarding_completed_at,
        }
        return Response(OnboardingSerializer(payload).data)
