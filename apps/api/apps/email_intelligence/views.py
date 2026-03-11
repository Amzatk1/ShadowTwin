from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.workspaces.models import Membership, Workspace

from .models import EmailThread
from .serializers import EmailThreadListSerializer


class EmailThreadListView(APIView):
    def get(self, request):
        workspace_slug = request.query_params.get("workspaceSlug")
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        threads = (
            EmailThread.objects.filter(workspace=workspace)
            .annotate(message_count=Count("messages"))
            .order_by("-needs_reply", "-is_sensitive", "-last_message_at")
        )
        payload = {
            "items": [
                {
                    "id": str(thread.id),
                    "subject": thread.subject,
                    "participants": thread.participants,
                    "waitingOn": thread.waiting_on,
                    "needsReply": thread.needs_reply,
                    "isSensitive": thread.is_sensitive,
                    "summary": thread.summary,
                    "status": thread.status,
                    "sourceUrl": thread.source_url,
                    "lastMessageAt": thread.last_message_at,
                    "messageCount": thread.message_count,
                    "extractedCommitments": [
                        commitment
                        for message in thread.messages.all().order_by("-sent_at")[:3]
                        for commitment in message.extracted_commitments
                    ],
                }
                for thread in threads
            ]
        }
        return Response(EmailThreadListSerializer(payload).data)
