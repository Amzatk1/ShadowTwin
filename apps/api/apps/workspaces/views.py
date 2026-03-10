from rest_framework.response import Response
from rest_framework.views import APIView


class TodayDashboardView(APIView):
    def get(self, _request, workspace_slug: str):
        return Response(
            {
                "workspace": workspace_slug,
                "priorities": [
                    "Investor follow-up window closes at 15:00",
                    "Meeting brief ready for Daniel Moss at 14:30",
                    "Three follow-ups may slip before 17:00",
                ],
                "actionQueue": [
                    {
                        "id": "approval_1",
                        "title": "Approve investor recap draft",
                        "description": "Prepared from four similar follow-ups in your style.",
                        "status": "approval",
                    }
                ],
                "meetings": [
                    {
                        "id": "meeting_1",
                        "title": "Daniel Moss / Series A prep",
                        "startTime": "14:30",
                    }
                ],
                "insights": [
                    {
                        "id": "insight_1",
                        "title": "Follow-up timing is part of your edge",
                        "confidence": 0.89,
                    }
                ],
            }
        )

