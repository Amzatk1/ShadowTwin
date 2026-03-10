from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.workspaces.models import Membership, Workspace

from .models import Recommendation
from .serializers import FeedSerializer


class FeedView(APIView):
    def get(self, request, workspace_slug: str):
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        recommendations = Recommendation.objects.filter(workspace=workspace).order_by("-created_at")[:10]
        payload = {
            "items": [
                {
                    "id": str(item.id),
                    "kind": item.recommendation_type,
                    "title": item.title,
                    "detail": item.detail,
                    "confidence": float(item.confidence),
                    "why": item.why_visible,
                    "createdAt": item.created_at,
                }
                for item in recommendations
            ]
        }
        serializer = FeedSerializer(payload)
        return Response(serializer.data)
