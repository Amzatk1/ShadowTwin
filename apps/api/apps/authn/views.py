from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.workspaces.models import Membership

from .serializers import LoginSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = (
            get_user_model()
            .objects.filter(email__iexact=serializer.validated_data["email"])
            .first()
        )
        if user is None or not user.check_password(serializer.validated_data["password"]):
            return Response({"detail": "Invalid credentials."}, status=400)

        membership = (
            Membership.objects.select_related("workspace")
            .filter(user=user)
            .order_by("created_at")
            .first()
        )
        if membership is None:
            return Response({"detail": "No workspace membership found."}, status=400)

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "accessToken": token.key,
                "refreshToken": token.key,
                "workspaceSlug": membership.workspace.slug,
                "user": {
                    "email": user.email,
                    "fullName": user.full_name or user.username,
                },
            }
        )
