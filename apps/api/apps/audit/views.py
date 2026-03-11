from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.workspaces.models import Membership, Workspace

from .models import AuditEvent
from .serializers import AuditListSerializer


class AuditListView(APIView):
    def get(self, request):
        workspace_slug = request.query_params.get("workspaceSlug")
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        items = [
            {
                "id": str(item.id),
                "actionType": item.action_type,
                "objectType": item.object_type,
                "objectId": item.object_id,
                "integration": item.integration,
                "createdAt": item.created_at,
                "metadata": item.metadata,
            }
            for item in AuditEvent.objects.filter(workspace=workspace).order_by("-created_at")[:25]
        ]
        return Response(AuditListSerializer({"items": items}).data)
