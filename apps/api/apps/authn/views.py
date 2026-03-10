from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(
            {
                "accessToken": "demo-access-token",
                "refreshToken": "demo-refresh-token",
                "user": {
                    "email": serializer.validated_data["email"],
                    "fullName": "Ayo Karim",
                },
            }
        )

