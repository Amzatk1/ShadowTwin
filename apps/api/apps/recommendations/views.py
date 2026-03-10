from rest_framework.response import Response
from rest_framework.views import APIView


class FeedView(APIView):
    def get(self, _request, workspace_slug: str):
        return Response(
            {
                "workspace": workspace_slug,
                "items": [
                    {
                        "id": "feed_1",
                        "kind": "warning",
                        "title": "Three follow-ups may slip today",
                        "detail": "Two sales threads and one candidate recap are at risk based on your usual cadence.",
                        "confidence": 0.84,
                        "why": "These threads match past obligations that you typically close within one business day.",
                    }
                ],
            }
        )

