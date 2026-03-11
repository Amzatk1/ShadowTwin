from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.workspaces.models import Membership, Workspace

from .models import Meeting
from .serializers import MeetingWorkspaceListSerializer


class MeetingListView(APIView):
    def get(self, request):
        workspace_slug = request.query_params.get("workspaceSlug")
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        meetings = (
            Meeting.objects.filter(workspace=workspace)
            .exclude(event_status="cancelled")
            .order_by("starts_at")
        )
        payload = {
            "items": [
                {
                    "id": str(meeting.id),
                    "title": meeting.title,
                    "startTime": meeting.starts_at,
                    "endTime": meeting.ends_at,
                    "participants": meeting.participants,
                    "priority": meeting.priority,
                    "summary": meeting.summary,
                    "extractedActions": (
                        meeting.meetingtranscript.extracted_actions
                        if hasattr(meeting, "meetingtranscript")
                        else []
                    ),
                }
                for meeting in meetings
            ]
        }
        return Response(MeetingWorkspaceListSerializer(payload).data)
