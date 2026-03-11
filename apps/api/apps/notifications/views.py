from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.workspaces.models import Membership, Workspace

from .models import Notification
from .serializers import NotificationListSerializer


class NotificationListView(APIView):
    def get(self, request):
        workspace_slug = request.query_params.get("workspaceSlug")
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        payload = {
            "items": [
                {
                    "id": str(item.id),
                    "category": item.category,
                    "channel": item.channel,
                    "title": item.title,
                    "body": item.body,
                    "status": item.status,
                    "actionUrl": item.action_url,
                    "createdAt": item.created_at,
                }
                for item in Notification.objects.filter(workspace=workspace, user=request.user).order_by("-created_at")[:20]
            ]
        }
        return Response(NotificationListSerializer(payload).data)


class NotificationReadView(APIView):
    def post(self, request, notification_id: str):
        notification = get_object_or_404(Notification, pk=notification_id)
        get_object_or_404(Membership, workspace=notification.workspace, user=request.user)
        notification.read_at = timezone.now()
        notification.status = "read"
        notification.save(update_fields=["read_at", "status"])
        AuditEvent.objects.create(
            workspace=notification.workspace,
            actor=request.user,
            action_type="notification.read",
            object_type="notification",
            object_id=str(notification.id),
            metadata={"category": notification.category},
        )
        return Response({"id": str(notification.id), "status": notification.status})
