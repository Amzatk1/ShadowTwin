from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.workspaces.models import Membership
from apps.workspaces.models import Workspace

from .models import MemoryItem
from .serializers import MemoryListSerializer


class MemoryListView(APIView):
    def get(self, request):
        workspace_slug = request.query_params.get("workspaceSlug")
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        payload = {
            "items": [
                {
                    "id": str(item.id),
                    "itemType": item.item_type,
                    "sourceLabel": item.source_label,
                    "title": item.title or item.source_label,
                    "summary": item.summary,
                    "content": item.content,
                    "learnEnabled": item.learn_enabled,
                    "hidden": item.is_hidden,
                    "createdAt": item.created_at,
                }
                for item in MemoryItem.objects.filter(
                    workspace=workspace,
                    is_hidden=False,
                    is_deleted=False,
                ).order_by("-created_at")[:20]
            ]
        }
        return Response(MemoryListSerializer(payload).data)


class MemoryHideView(APIView):
    def post(self, request, memory_id: str):
        item = get_object_or_404(MemoryItem, pk=memory_id)
        get_object_or_404(Membership, workspace=item.workspace, user=request.user)
        item.is_hidden = True
        item.save(update_fields=["is_hidden"])
        AuditEvent.objects.create(
            workspace=item.workspace,
            actor=request.user,
            action_type="memory.hidden",
            object_type="memory_item",
            object_id=str(item.id),
            metadata={"title": item.title},
        )
        return Response({"id": str(item.id), "hidden": True})


class MemoryExcludeLearningView(APIView):
    def post(self, request, memory_id: str):
        item = get_object_or_404(MemoryItem, pk=memory_id)
        get_object_or_404(Membership, workspace=item.workspace, user=request.user)
        item.learn_enabled = False
        item.save(update_fields=["learn_enabled"])
        AuditEvent.objects.create(
            workspace=item.workspace,
            actor=request.user,
            action_type="memory.learning_disabled",
            object_type="memory_item",
            object_id=str(item.id),
            metadata={"title": item.title},
        )
        return Response({"id": str(item.id), "learnEnabled": False})
