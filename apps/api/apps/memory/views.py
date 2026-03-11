from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.workspaces.models import Membership

from .models import MemoryItem


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
