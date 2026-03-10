from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ApprovalDecisionSerializer


class ApprovalDecisionView(APIView):
    def post(self, request, approval_id: str):
        serializer = ApprovalDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            {
                "approvalId": approval_id,
                "status": f"{serializer.validated_data['decision']}d",
                "note": serializer.validated_data.get("note", ""),
            }
        )

