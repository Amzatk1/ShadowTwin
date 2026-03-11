from datetime import timedelta
import uuid

import jwt
from django.conf import settings
from django.utils import timezone

from apps.workspaces.models import Membership

from .models import AuthSession


def _encode_token(*, token_type: str, session: AuthSession, jti: uuid.UUID, expires_at):
    return jwt.encode(
        {
            "sub": str(session.user_id),
            "sid": str(session.id),
            "wid": str(session.workspace_id),
            "jti": str(jti),
            "type": token_type,
            "iat": int(timezone.now().timestamp()),
            "exp": int(expires_at.timestamp()),
            "iss": settings.JWT_ISSUER,
            "aud": settings.JWT_AUDIENCE,
        },
        settings.JWT_SIGNING_KEY,
        algorithm="HS256",
    )


def get_primary_membership(user):
    return (
        Membership.objects.select_related("workspace")
        .filter(user=user)
        .order_by("created_at")
        .first()
    )


def issue_session_tokens(*, user, workspace, request):
    refresh_expires_at = timezone.now() + timedelta(days=settings.JWT_REFRESH_LIFETIME_DAYS)
    auth_session = AuthSession.objects.create(
        user=user,
        workspace=workspace,
        user_agent=(request.headers.get("User-Agent", "") or "")[:255],
        ip_address=get_client_ip(request),
        expires_at=refresh_expires_at,
    )
    return build_session_payload(auth_session)


def rotate_session_tokens(*, auth_session: AuthSession):
    auth_session.access_jti = uuid.uuid4()
    auth_session.refresh_jti = uuid.uuid4()
    auth_session.expires_at = timezone.now() + timedelta(days=settings.JWT_REFRESH_LIFETIME_DAYS)
    auth_session.save(update_fields=["access_jti", "refresh_jti", "expires_at", "last_seen_at"])
    return build_session_payload(auth_session)


def build_session_payload(auth_session: AuthSession):
    access_expires_at = timezone.now() + timedelta(minutes=settings.JWT_ACCESS_LIFETIME_MINUTES)
    access_token = _encode_token(
        token_type="access",
        session=auth_session,
        jti=auth_session.access_jti,
        expires_at=access_expires_at,
    )
    refresh_token = _encode_token(
        token_type="refresh",
        session=auth_session,
        jti=auth_session.refresh_jti,
        expires_at=auth_session.expires_at,
    )
    return {
        "accessToken": access_token,
        "refreshToken": refresh_token,
        "workspaceSlug": auth_session.workspace.slug,
        "workspace": {
            "id": str(auth_session.workspace.id),
            "name": auth_session.workspace.name,
            "slug": auth_session.workspace.slug,
            "stage": auth_session.workspace.stage,
        },
        "user": {
            "id": str(auth_session.user.id),
            "email": auth_session.user.email,
            "fullName": auth_session.user.full_name or auth_session.user.username,
        },
    }


def decode_refresh_token(token: str):
    return jwt.decode(
        token,
        settings.JWT_SIGNING_KEY,
        algorithms=["HS256"],
        audience=settings.JWT_AUDIENCE,
        issuer=settings.JWT_ISSUER,
    )


def get_client_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")
