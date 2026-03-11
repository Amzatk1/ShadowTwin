from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.workspaces.models import Membership, Workspace

from .models import Recommendation
from .serializers import FeedSerializer


class FeedView(APIView):
    def get(self, request, workspace_slug: str):
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        recommendations = (
            Recommendation.objects.filter(workspace=workspace)
            .exclude(status="dismissed")
            .order_by("-pinned_at", "-confidence", "-created_at")[:10]
        )
        payload = {
            "items": [
                {
                    "id": str(item.id),
                    "kind": item.recommendation_type,
                    "title": item.title,
                    "detail": item.detail,
                    "confidence": float(item.confidence),
                    "why": item.why_visible,
                    "riskLevel": item.risk_level,
                    "sourceRefs": item.source_refs,
                    "createdAt": item.created_at,
                }
                for item in recommendations
            ]
        }
        serializer = FeedSerializer(payload)
        return Response(serializer.data)


class RecommendationDismissView(APIView):
    def post(self, request, recommendation_id: str):
        recommendation = get_object_or_404(Recommendation, pk=recommendation_id)
        get_object_or_404(Membership, workspace=recommendation.workspace, user=request.user)
        recommendation.status = "dismissed"
        recommendation.dismissed_at = timezone.now()
        recommendation.save(update_fields=["status", "dismissed_at"])
        AuditEvent.objects.create(
            workspace=recommendation.workspace,
            actor=request.user,
            action_type="recommendation.dismissed",
            object_type="recommendation",
            object_id=str(recommendation.id),
            metadata={"title": recommendation.title},
        )
        return Response({"id": str(recommendation.id), "status": recommendation.status})


class RecommendationPinView(APIView):
    def post(self, request, recommendation_id: str):
        recommendation = get_object_or_404(Recommendation, pk=recommendation_id)
        get_object_or_404(Membership, workspace=recommendation.workspace, user=request.user)
        recommendation.status = "pinned"
        recommendation.pinned_at = timezone.now()
        recommendation.save(update_fields=["status", "pinned_at"])
        AuditEvent.objects.create(
            workspace=recommendation.workspace,
            actor=request.user,
            action_type="recommendation.pinned",
            object_type="recommendation",
            object_id=str(recommendation.id),
            metadata={"title": recommendation.title},
        )
        return Response({"id": str(recommendation.id), "status": recommendation.status})
