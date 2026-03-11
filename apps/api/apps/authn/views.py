from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuthSession
from .serializers import LoginSerializer, RefreshSerializer
from .services import decode_refresh_token, get_primary_membership, issue_session_tokens, rotate_session_tokens


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

        membership = get_primary_membership(user)
        if membership is None:
            return Response({"detail": "No workspace membership found."}, status=400)

        return Response(issue_session_tokens(user=user, workspace=membership.workspace, request=request))


class RefreshView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            payload = decode_refresh_token(serializer.validated_data["refreshToken"])
        except Exception:  # noqa: BLE001
            return Response({"detail": "Invalid refresh token."}, status=401)

        if payload.get("type") != "refresh":
            return Response({"detail": "Invalid refresh token type."}, status=401)

        auth_session = (
            AuthSession.objects.select_related("user", "workspace")
            .filter(
                pk=payload["sid"],
                user_id=payload["sub"],
                refresh_jti=payload["jti"],
                is_active=True,
                expires_at__gt=timezone.now(),
            )
            .first()
        )
        if auth_session is None:
            return Response({"detail": "Refresh session is no longer active."}, status=401)

        return Response(rotate_session_tokens(auth_session=auth_session))


class LogoutView(APIView):
    def post(self, request):
        auth_session = getattr(request, "auth_session", None)
        if auth_session is None:
            refresh_token = request.data.get("refreshToken")
            if refresh_token:
                try:
                    payload = decode_refresh_token(refresh_token)
                except Exception:  # noqa: BLE001
                    payload = None
                if payload:
                    auth_session = AuthSession.objects.filter(
                        pk=payload["sid"],
                        user_id=payload["sub"],
                        refresh_jti=payload["jti"],
                        is_active=True,
                    ).first()
        if auth_session is not None:
            auth_session.is_active = False
            auth_session.save(update_fields=["is_active", "last_seen_at"])
        return Response(status=204)


class MeView(APIView):
    def get(self, request):
        membership = get_primary_membership(request.user)
        return Response(
            {
                "id": str(request.user.id),
                "name": request.user.full_name or request.user.username,
                "role": membership.role if membership else "owner",
                "workspaceId": str(membership.workspace_id) if membership else "",
                "workspace": {
                    "id": str(membership.workspace.id) if membership else "",
                    "name": membership.workspace.name if membership else "",
                    "slug": membership.workspace.slug if membership else "",
                    "stage": membership.workspace.stage if membership else "observe",
                },
            }
        )
