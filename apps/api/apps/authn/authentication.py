import jwt
from django.conf import settings
from rest_framework import authentication, exceptions

from .models import AuthSession


class ShadowTwinJWTAuthentication(authentication.BaseAuthentication):
    keyword = "Bearer"

    def authenticate(self, request):
        header = authentication.get_authorization_header(request).decode("utf-8")
        if not header:
            return None

        parts = header.split()
        if len(parts) != 2 or parts[0] != self.keyword:
            return None

        token = parts[1]
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SIGNING_KEY,
                algorithms=["HS256"],
                audience=settings.JWT_AUDIENCE,
                issuer=settings.JWT_ISSUER,
            )
        except jwt.ExpiredSignatureError as exc:
            raise exceptions.AuthenticationFailed("Access token expired.") from exc
        except jwt.PyJWTError as exc:
            raise exceptions.AuthenticationFailed("Invalid access token.") from exc

        if payload.get("type") != "access":
            raise exceptions.AuthenticationFailed("Invalid access token type.")

        try:
            auth_session = (
                AuthSession.objects.select_related("user", "workspace")
                .get(
                    pk=payload["sid"],
                    user_id=payload["sub"],
                    access_jti=payload["jti"],
                    is_active=True,
                )
            )
        except AuthSession.DoesNotExist as exc:
            raise exceptions.AuthenticationFailed("Session is no longer active.") from exc

        request.auth_session = auth_session
        request.workspace = auth_session.workspace
        return auth_session.user, payload
