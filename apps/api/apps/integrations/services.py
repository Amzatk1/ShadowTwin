from __future__ import annotations

from datetime import timedelta
from email.utils import parseaddr

from django.conf import settings
from django.core import signing
from django.utils import timezone

from apps.adapters.providers.common.types import ProviderEmailThread, ProviderMeeting, ProviderScope
from apps.adapters.providers.google.demo import build_founder_demo_bundle
from apps.adapters.providers.google.oauth import (
    GoogleOAuthAdapter,
    GoogleOAuthError,
    GoogleReauthRequiredError,
    GoogleSyncRecoveryRequiredError,
)
from apps.ai.pipelines.founder_signals import rebuild_founder_signal_layer
from apps.approvals.models import ApprovalRequest
from apps.audit.models import AuditEvent
from apps.email_intelligence.models import Contact, EmailMessage, EmailThread
from apps.ingestion.models import IngestionEvent
from apps.integrations.crypto import decrypt_secret, encrypt_secret
from apps.integrations.models import ExternalAccount, IntegrationConnection, OAuthTokenRef
from apps.meetings.models import Meeting
from apps.memory.models import MemoryItem
from apps.privacy.models import DataSourceScope, PrivacyPolicySetting
from apps.twins.models import TwinProfile


GOOGLE_STATE_SALT = "shadowtwin.google.oauth"
GOOGLE_OAUTH_SCOPES = {
    "gmail://label/Inbox": "https://www.googleapis.com/auth/gmail.readonly",
    "gmail://label/Board": "https://www.googleapis.com/auth/gmail.readonly",
    "calendar://primary": "https://www.googleapis.com/auth/calendar.readonly",
}
GOOGLE_SCOPE_DEFINITIONS = {
    "gmail://label/Inbox": ProviderScope(
        source_path="gmail://label/Inbox",
        display_name="Gmail inbox",
        source_type="label",
        mode="read-only",
        learn_enabled=True,
    ),
    "gmail://label/Board": ProviderScope(
        source_path="gmail://label/Board",
        display_name="Board and investor label",
        source_type="label",
        mode="read-only",
        learn_enabled=False,
    ),
    "calendar://primary": ProviderScope(
        source_path="calendar://primary",
        display_name="Primary calendar",
        source_type="calendar",
        mode="read-only",
        learn_enabled=True,
    ),
}
DEFAULT_SCOPE_PATHS = sorted(GOOGLE_SCOPE_DEFINITIONS)


def google_oauth_configured() -> bool:
    return bool(
        settings.GOOGLE_CLIENT_ID
        and settings.GOOGLE_CLIENT_SECRET
        and settings.GOOGLE_REDIRECT_URI
    )


def ensure_google_demo_connection(*, workspace, user, mode: str, selected_scopes: list[str] | None):
    bundle = build_founder_demo_bundle()
    selected = _selected_scope_paths(selected_scopes)
    connection = _upsert_google_connection(
        workspace=workspace,
        mode=mode,
        selected_scopes=selected,
        defaults={
            "display_name": "Google Workspace",
            "provider_account_id": bundle.account_label,
            "provider_email": bundle.account_label,
            "account_label": bundle.account_label,
            "status": "connected",
            "metadata": {"demoMode": True},
            "granted_scopes": _requested_google_oauth_scopes(selected),
            "capabilities": _build_capabilities(selected, mode=mode, demo_mode=True),
            "sync_state": {},
            "sync_cursor": {},
            "sync_mode": "demo",
            "last_sync_status": "pending",
            "last_sync_error": "",
            "last_sync_error_code": "",
            "last_sync_error_message": "",
            "requires_reauth": False,
            "is_enabled": True,
        },
    )
    ExternalAccount.objects.update_or_create(
        connection=connection,
        external_id=bundle.account_label,
        defaults={"account_label": bundle.account_label},
    )
    OAuthTokenRef.objects.update_or_create(
        connection=connection,
        defaults={
            "token_reference": f"demo-google-access:{workspace.slug}",
            "refresh_reference": f"demo-google-refresh:{workspace.slug}",
            "granted_scopes": _requested_google_oauth_scopes(selected),
            "issued_at": timezone.now(),
            "expires_at": timezone.now() + timedelta(days=30),
        },
    )
    _sync_scope_records(connection=connection, workspace=workspace, mode=mode, selected_scopes=selected)
    _ensure_workspace_defaults(workspace=workspace, user=user)
    sync_google_demo_connection(connection=connection, workspace=workspace, user=user)
    return connection


def start_google_connection(*, workspace, user, mode: str, selected_scopes: list[str] | None) -> dict[str, object]:
    selected = _selected_scope_paths(selected_scopes)
    if not google_oauth_configured():
        connection = ensure_google_demo_connection(
            workspace=workspace,
            user=user,
            mode=mode,
            selected_scopes=selected,
        )
        AuditEvent.objects.create(
            workspace=workspace,
            actor=user,
            action_type="integration.google.connect",
            object_type="integration_connection",
            object_id=str(connection.id),
            integration="google",
            metadata={"mode": connection.mode, "live": False},
        )
        return {
            "connection": connection,
            "authUrl": "",
            "demoMode": True,
            "requiresExternalConsent": False,
        }

    connection = _upsert_google_connection(
        workspace=workspace,
        mode=mode,
        selected_scopes=selected,
        defaults={
            "display_name": "Google Workspace",
            "provider_account_id": "",
            "provider_email": "",
            "account_label": "",
            "status": "pending-auth",
            "metadata": {"demoMode": False},
            "granted_scopes": [],
            "capabilities": _build_capabilities(selected, mode=mode, demo_mode=False),
            "sync_state": {},
            "sync_cursor": {},
            "sync_mode": "bootstrap",
            "last_sync_status": "pending",
            "last_sync_error": "",
            "last_sync_error_code": "",
            "last_sync_error_message": "",
            "requires_reauth": False,
            "is_enabled": True,
        },
    )
    _sync_scope_records(connection=connection, workspace=workspace, mode=mode, selected_scopes=selected)

    state = signing.dumps(
        {
            "connectionId": str(connection.id),
            "workspaceId": str(workspace.id),
            "userId": str(user.id),
            "mode": mode,
            "selectedScopes": selected,
        },
        salt=GOOGLE_STATE_SALT,
    )
    auth_url = GoogleOAuthAdapter().get_auth_url(
        state=state,
        scopes=_requested_google_oauth_scopes(selected),
    )
    AuditEvent.objects.create(
        workspace=workspace,
        actor=user,
        action_type="integration.google.oauth.started",
        object_type="integration_connection",
        object_id=str(connection.id),
        integration="google",
        metadata={"mode": mode, "scopeCount": len(selected), "live": True},
    )
    return {
        "connection": connection,
        "authUrl": auth_url,
        "demoMode": False,
        "requiresExternalConsent": True,
    }


def complete_google_oauth_callback(*, user, code: str, state: str) -> IntegrationConnection:
    payload = signing.loads(state, salt=GOOGLE_STATE_SALT, max_age=900)
    if str(payload.get("userId")) != str(user.id):
        raise RuntimeError("Google callback does not belong to the current session.")

    connection = IntegrationConnection.objects.select_related("workspace").get(
        pk=payload["connectionId"],
        workspace_id=payload["workspaceId"],
        provider="google",
    )
    selected_scopes = _selected_scope_paths(payload.get("selectedScopes"))
    mode = payload.get("mode", "read-only")
    adapter = GoogleOAuthAdapter()
    token_payload = adapter.exchange_code(code=code)
    access_token = token_payload.get("access_token", "")
    if not access_token:
        raise RuntimeError("Google did not return an access token.")
    refresh_token = token_payload.get("refresh_token", "")
    granted_scopes = sorted(
        token_payload.get("scope", "").split() or _requested_google_oauth_scopes(selected_scopes)
    )
    profile = adapter.fetch_account_profile(access_token=access_token)
    provider_email = profile.get("email", "")
    provider_account_id = str(profile.get("id") or provider_email or connection.id)

    connection.provider_account_id = provider_account_id
    connection.provider_email = provider_email
    connection.account_label = provider_email or profile.get("name", "Google account")
    connection.mode = mode
    connection.status = "syncing"
    connection.scopes = selected_scopes
    connection.granted_scopes = granted_scopes
    connection.metadata = {
        **(connection.metadata or {}),
        "demoMode": False,
        "profileName": profile.get("name", ""),
    }
    connection.capabilities = _build_capabilities(selected_scopes, mode=mode, demo_mode=False)
    connection.sync_cursor = {}
    connection.sync_state = {}
    connection.sync_mode = "bootstrap"
    connection.last_sync_status = "pending"
    connection.last_sync_error = ""
    connection.last_sync_error_code = ""
    connection.last_sync_error_message = ""
    connection.requires_reauth = False
    connection.save(
        update_fields=[
            "provider_account_id",
            "provider_email",
            "account_label",
            "mode",
            "status",
            "scopes",
            "granted_scopes",
            "metadata",
            "capabilities",
            "sync_cursor",
            "sync_state",
            "sync_mode",
            "last_sync_status",
            "last_sync_error",
            "last_sync_error_code",
            "last_sync_error_message",
            "requires_reauth",
            "updated_at",
        ]
    )

    ExternalAccount.objects.update_or_create(
        connection=connection,
        external_id=provider_account_id,
        defaults={"account_label": connection.account_label},
    )
    existing_token_ref = OAuthTokenRef.objects.filter(connection=connection).first()
    existing_refresh_token = (
        decrypt_secret(existing_token_ref.refresh_token_ciphertext)
        if existing_token_ref and existing_token_ref.refresh_token_ciphertext
        else ""
    )
    OAuthTokenRef.objects.update_or_create(
        connection=connection,
        defaults={
            "token_reference": f"google-access:{connection.workspace.slug}:{provider_account_id}",
            "refresh_reference": f"google-refresh:{connection.workspace.slug}:{provider_account_id}",
            "access_token_ciphertext": encrypt_secret(access_token),
            "refresh_token_ciphertext": encrypt_secret(refresh_token or existing_refresh_token),
            "granted_scopes": granted_scopes,
            "token_type": token_payload.get("token_type", "Bearer"),
            "issued_at": timezone.now(),
            "expires_at": timezone.now() + timedelta(seconds=int(token_payload.get("expires_in", 3600))),
        },
    )
    _sync_scope_records(
        connection=connection,
        workspace=connection.workspace,
        mode=mode,
        selected_scopes=selected_scopes,
    )

    AuditEvent.objects.create(
        workspace=connection.workspace,
        actor=user,
        action_type="integration.google.oauth.completed",
        object_type="integration_connection",
        object_id=str(connection.id),
        integration="google",
        metadata={
            "account": connection.provider_email,
            "grantedScopeCount": len(granted_scopes),
        },
    )
    enqueue_google_sync(connection=connection, workspace=connection.workspace, user=user)
    connection.refresh_from_db()
    return connection


def enqueue_google_sync(*, connection: IntegrationConnection, workspace, user) -> IntegrationConnection:
    from apps.worker.worker.jobs.ingestion import sync_gmail_threads

    try:
        sync_gmail_threads.delay(str(connection.id))
        connection.status = "syncing"
        connection.last_sync_status = "queued"
        connection.save(update_fields=["status", "last_sync_status", "updated_at"])
        return connection
    except Exception:
        return sync_google_connection(connection=connection, workspace=workspace, user=user)


def sync_google_connection(*, connection: IntegrationConnection, workspace, user) -> IntegrationConnection:
    if (connection.metadata or {}).get("demoMode", False):
        return sync_google_demo_connection(connection=connection, workspace=workspace, user=user)
    return sync_google_live_connection(connection=connection, workspace=workspace, user=user)


def sync_google_demo_connection(*, connection, workspace, user):
    bundle = build_founder_demo_bundle()
    _ensure_workspace_defaults(workspace=workspace, user=user)
    allowed_scopes = set(connection.scopes or DEFAULT_SCOPE_PATHS)
    _mark_sync_started(connection=connection, sync_mode="demo")

    EmailThread.objects.filter(workspace=workspace, external_id__startswith="gmail-thread-").delete()
    Meeting.objects.filter(workspace=workspace, external_id__startswith="calendar-").delete()
    IngestionEvent.objects.filter(workspace=workspace, connection=connection).delete()
    MemoryItem.objects.filter(
        workspace=workspace,
        source_object_id__in=["doc-diligence-notes", "capture-acme-renewal"],
    ).delete()
    ApprovalRequest.objects.filter(workspace=workspace, source_label="ShadowTwin").delete()

    synced_thread_count = 0
    synced_meeting_count = 0
    if {"gmail://label/Inbox", "gmail://label/Board"} & allowed_scopes:
        synced_thread_count = _sync_email_threads(
            workspace=workspace,
            connection=connection,
            account_email=bundle.account_label,
            threads=bundle.email_threads,
        )
    if "calendar://primary" in allowed_scopes:
        synced_meeting_count = _sync_meetings(
            workspace=workspace,
            connection=connection,
            account_email=bundle.account_label,
            meetings=bundle.meetings,
        )

    twin = TwinProfile.objects.get(workspace=workspace, owner=user)
    for item in bundle.memory_items:
        MemoryItem.objects.update_or_create(
            workspace=workspace,
            twin=twin,
            source_object_id=item.source_object_id,
            defaults={
                "item_type": item.item_type,
                "title": item.title,
                "summary": item.summary,
                "content": item.content,
                "source_label": item.source_label,
                "learn_enabled": True,
            },
        )

    _mark_sync_success(
        connection=connection,
        sync_mode="demo",
        sync_cursor={},
        sync_state={
            "lastSyncMode": "demo",
            "syncedThreadCount": synced_thread_count,
            "syncedMeetingCount": synced_meeting_count,
        },
        last_sync_status="synced",
        connection_status="connected",
    )
    connection.granted_scopes = _requested_google_oauth_scopes(sorted(allowed_scopes))
    connection.save(update_fields=["granted_scopes", "updated_at"])

    rebuild_founder_signal_layer(workspace=workspace, user=user)
    AuditEvent.objects.create(
        workspace=workspace,
        actor=user,
        action_type="integration.google.sync",
        object_type="integration_connection",
        object_id=str(connection.id),
        integration="google",
        metadata={
            "mode": connection.mode,
            "scopeCount": len(allowed_scopes),
            "threadCount": synced_thread_count,
            "meetingCount": synced_meeting_count,
            "syncMode": "demo",
            "live": False,
        },
    )
    return connection


def sync_google_live_connection(*, connection: IntegrationConnection, workspace, user) -> IntegrationConnection:
    _ensure_workspace_defaults(workspace=workspace, user=user)
    adapter = GoogleOAuthAdapter()
    selected_scopes = set(connection.scopes or DEFAULT_SCOPE_PATHS)
    sync_cursor = dict(connection.sync_cursor or {})
    sync_state = dict(connection.sync_state or {})
    sync_mode = "incremental" if sync_cursor else "bootstrap"
    _mark_sync_started(connection=connection, sync_mode=sync_mode)

    try:
        access_token = _resolve_google_access_token(connection=connection, adapter=adapter)
        if not connection.provider_email:
            profile = adapter.fetch_account_profile(access_token=access_token)
            connection.provider_email = profile.get("email", connection.provider_email)
            connection.provider_account_id = str(profile.get("id") or connection.provider_account_id)
            connection.account_label = connection.provider_email or connection.account_label
            connection.metadata = {
                **(connection.metadata or {}),
                "profileName": profile.get("name", ""),
            }
            connection.save(
                update_fields=[
                    "provider_email",
                    "provider_account_id",
                    "account_label",
                    "metadata",
                    "updated_at",
                ]
            )

        failures: list[tuple[str, str]] = []
        synced_thread_count = 0
        synced_meeting_count = 0

        if any(scope_path.startswith("gmail://") for scope_path in selected_scopes):
            try:
                synced_thread_count, email_cursor, email_state = _sync_google_live_email(
                    adapter=adapter,
                    access_token=access_token,
                    connection=connection,
                    workspace=workspace,
                    account_email=connection.provider_email,
                    sync_cursor=sync_cursor,
                )
                sync_cursor.update(email_cursor)
                sync_state.update(email_state)
            except GoogleReauthRequiredError as exc:
                failures.append(("google_auth_invalid", str(exc)))
            except GoogleOAuthError as exc:
                failures.append(("gmail_sync_failed", str(exc)))

        if "calendar://primary" in selected_scopes:
            try:
                synced_meeting_count, calendar_cursor, calendar_state = _sync_google_live_calendar(
                    adapter=adapter,
                    access_token=access_token,
                    connection=connection,
                    workspace=workspace,
                    account_email=connection.provider_email,
                    sync_cursor=sync_cursor,
                )
                sync_cursor.update(calendar_cursor)
                sync_state.update(calendar_state)
            except GoogleReauthRequiredError as exc:
                failures.append(("google_auth_invalid", str(exc)))
            except GoogleOAuthError as exc:
                failures.append(("calendar_sync_failed", str(exc)))

        if failures:
            error_code = failures[0][0]
            error_message = " | ".join(message for _, message in failures)[:500]
            if synced_thread_count or synced_meeting_count:
                _mark_sync_success(
                    connection=connection,
                    sync_mode=sync_mode,
                    sync_cursor=sync_cursor,
                    sync_state={
                        **sync_state,
                        "syncedThreadCount": synced_thread_count,
                        "syncedMeetingCount": synced_meeting_count,
                    },
                    last_sync_status="partial",
                    connection_status="partial-sync",
                    error_code=error_code,
                    error_message=error_message,
                )
                rebuild_founder_signal_layer(workspace=workspace, user=user)
                AuditEvent.objects.create(
                    workspace=workspace,
                    actor=user,
                    action_type="integration.google.sync.partial",
                    object_type="integration_connection",
                    object_id=str(connection.id),
                    integration="google",
                    metadata={
                        "threadCount": synced_thread_count,
                        "meetingCount": synced_meeting_count,
                        "errors": failures,
                    },
                )
            else:
                _mark_sync_failure(
                    connection=connection,
                    connection_status="reauth-required" if error_code == "google_auth_invalid" else "sync-failed",
                    last_sync_status="reauth-required" if error_code == "google_auth_invalid" else "failed",
                    error_code=error_code,
                    error_message=error_message,
                    requires_reauth=error_code == "google_auth_invalid",
                )
                AuditEvent.objects.create(
                    workspace=workspace,
                    actor=user,
                    action_type="integration.google.sync.failed",
                    object_type="integration_connection",
                    object_id=str(connection.id),
                    integration="google",
                    metadata={"errors": failures},
                )
            return connection

        _mark_sync_success(
            connection=connection,
            sync_mode=sync_mode,
            sync_cursor=sync_cursor,
            sync_state={
                **sync_state,
                "syncedThreadCount": synced_thread_count,
                "syncedMeetingCount": synced_meeting_count,
            },
            last_sync_status="synced",
            connection_status="connected",
        )
        rebuild_founder_signal_layer(workspace=workspace, user=user)
        AuditEvent.objects.create(
            workspace=workspace,
            actor=user,
            action_type="integration.google.sync",
            object_type="integration_connection",
            object_id=str(connection.id),
            integration="google",
            metadata={
                "mode": connection.mode,
                "scopeCount": len(selected_scopes),
                "threadCount": synced_thread_count,
                "meetingCount": synced_meeting_count,
                "syncMode": sync_mode,
                "live": True,
            },
        )
        return connection
    except GoogleReauthRequiredError as exc:
        _mark_sync_failure(
            connection=connection,
            connection_status="reauth-required",
            last_sync_status="reauth-required",
            error_code="google_auth_invalid",
            error_message=str(exc),
            requires_reauth=True,
        )
        AuditEvent.objects.create(
            workspace=workspace,
            actor=user,
            action_type="integration.google.sync.failed",
            object_type="integration_connection",
            object_id=str(connection.id),
            integration="google",
            metadata={"error": str(exc), "code": "google_auth_invalid"},
        )
    except GoogleOAuthError as exc:
        _mark_sync_failure(
            connection=connection,
            connection_status="sync-failed",
            last_sync_status="failed",
            error_code="google_sync_failed",
            error_message=str(exc),
        )
        AuditEvent.objects.create(
            workspace=workspace,
            actor=user,
            action_type="integration.google.sync.failed",
            object_type="integration_connection",
            object_id=str(connection.id),
            integration="google",
            metadata={"error": str(exc), "code": "google_sync_failed"},
        )
    return connection


def _sync_google_live_email(
    *,
    adapter: GoogleOAuthAdapter,
    access_token: str,
    connection: IntegrationConnection,
    workspace,
    account_email: str,
    sync_cursor: dict,
) -> tuple[int, dict, dict]:
    email_cursor = {"gmailHistoryId": sync_cursor.get("gmailHistoryId")} if sync_cursor.get("gmailHistoryId") else {}
    email_state: dict[str, object] = {}
    try:
        threads, next_cursor = adapter.fetch_recent_threads(
            access_token=access_token,
            max_results=20,
            sync_state=email_cursor,
        )
    except GoogleSyncRecoveryRequiredError:
        threads, next_cursor = adapter.fetch_recent_threads(
            access_token=access_token,
            max_results=20,
            sync_state={},
        )
        email_state["gmailRecoveryPerformed"] = True
        email_state["gmailSyncMode"] = "recovery-bootstrap"
    else:
        email_state["gmailSyncMode"] = "incremental" if email_cursor else "bootstrap"
    synced_thread_count = _sync_email_threads(
        workspace=workspace,
        connection=connection,
        account_email=account_email,
        threads=threads,
    )
    email_state["gmailSyncedThreadCount"] = synced_thread_count
    email_state["gmailLastSyncAt"] = timezone.now().isoformat()
    return synced_thread_count, {"gmailHistoryId": next_cursor.get("gmailHistoryId", "")}, email_state


def _sync_google_live_calendar(
    *,
    adapter: GoogleOAuthAdapter,
    access_token: str,
    connection: IntegrationConnection,
    workspace,
    account_email: str,
    sync_cursor: dict,
) -> tuple[int, dict, dict]:
    calendar_cursor = {"calendarSyncToken": sync_cursor.get("calendarSyncToken")} if sync_cursor.get("calendarSyncToken") else {}
    calendar_state: dict[str, object] = {}
    try:
        meetings, next_cursor = adapter.fetch_upcoming_events(
            access_token=access_token,
            max_results=12,
            sync_state=calendar_cursor,
        )
    except GoogleSyncRecoveryRequiredError:
        meetings, next_cursor = adapter.fetch_upcoming_events(
            access_token=access_token,
            max_results=12,
            sync_state={},
        )
        calendar_state["calendarRecoveryPerformed"] = True
        calendar_state["calendarSyncMode"] = "recovery-bootstrap"
    else:
        calendar_state["calendarSyncMode"] = "incremental" if calendar_cursor else "bootstrap"
    synced_meeting_count = _sync_meetings(
        workspace=workspace,
        connection=connection,
        account_email=account_email,
        meetings=meetings,
    )
    calendar_state["calendarSyncedMeetingCount"] = synced_meeting_count
    calendar_state["calendarLastSyncAt"] = timezone.now().isoformat()
    return synced_meeting_count, {"calendarSyncToken": next_cursor.get("calendarSyncToken", "")}, calendar_state


def _resolve_google_access_token(*, connection: IntegrationConnection, adapter: GoogleOAuthAdapter) -> str:
    token_ref = OAuthTokenRef.objects.filter(connection=connection).first()
    if token_ref is None:
        raise GoogleOAuthError("No Google token reference is available for this connection.")

    refresh_token = decrypt_secret(token_ref.refresh_token_ciphertext) if token_ref.refresh_token_ciphertext else ""
    access_token = decrypt_secret(token_ref.access_token_ciphertext) if token_ref.access_token_ciphertext else ""
    expires_soon = token_ref.expires_at is None or token_ref.expires_at <= timezone.now() + timedelta(minutes=5)
    if access_token and not expires_soon:
        return access_token
    if not refresh_token:
        raise GoogleReauthRequiredError("Google refresh token is missing. Reconnect the account.")

    refresh_payload = adapter.refresh_access_token(refresh_token=refresh_token)
    next_access_token = refresh_payload.get("access_token", "")
    if not next_access_token:
        raise GoogleReauthRequiredError("Google refresh did not return a new access token.")
    token_ref.access_token_ciphertext = encrypt_secret(next_access_token)
    token_ref.token_type = refresh_payload.get("token_type", token_ref.token_type)
    token_ref.issued_at = timezone.now()
    token_ref.expires_at = timezone.now() + timedelta(seconds=int(refresh_payload.get("expires_in", 3600)))
    if refresh_payload.get("scope"):
        token_ref.granted_scopes = sorted(refresh_payload["scope"].split())
    token_ref.save(
        update_fields=[
            "access_token_ciphertext",
            "token_type",
            "issued_at",
            "expires_at",
            "granted_scopes",
        ]
    )
    connection.granted_scopes = token_ref.granted_scopes
    connection.requires_reauth = False
    connection.last_sync_error = ""
    connection.last_sync_error_code = ""
    connection.last_sync_error_message = ""
    connection.save(
        update_fields=[
            "granted_scopes",
            "requires_reauth",
            "last_sync_error",
            "last_sync_error_code",
            "last_sync_error_message",
            "updated_at",
        ]
    )
    return next_access_token


def _ensure_workspace_defaults(*, workspace, user) -> TwinProfile:
    twin, _ = TwinProfile.objects.get_or_create(
        workspace=workspace,
        owner=user,
        defaults={
            "stage": "suggest",
            "confidence_score": 0.84,
            "priorities_summary": "Inbox and calendar observe/suggest mode is active.",
        },
    )
    PrivacyPolicySetting.objects.get_or_create(
        workspace=workspace,
        defaults={
            "retention_days": 90,
            "approval_mode": "required",
            "learning_enabled": True,
        },
    )
    return twin


def _upsert_google_connection(*, workspace, mode: str, selected_scopes: list[str], defaults: dict) -> IntegrationConnection:
    connection = (
        IntegrationConnection.objects.filter(workspace=workspace, provider="google")
        .order_by("-updated_at", "-created_at")
        .first()
    )
    if connection is None:
        return IntegrationConnection.objects.create(
            workspace=workspace,
            provider="google",
            mode=mode,
            scopes=selected_scopes,
            **defaults,
        )
    for field, value in {**defaults, "mode": mode, "scopes": selected_scopes}.items():
        setattr(connection, field, value)
    connection.save()
    return connection


def _selected_scope_paths(selected_scopes: list[str] | None) -> list[str]:
    selected = sorted(set(selected_scopes or DEFAULT_SCOPE_PATHS))
    return [scope for scope in selected if scope in GOOGLE_SCOPE_DEFINITIONS]


def _requested_google_oauth_scopes(selected_scopes: list[str]) -> list[str]:
    return sorted({GOOGLE_OAUTH_SCOPES[scope] for scope in selected_scopes if scope in GOOGLE_OAUTH_SCOPES})


def _build_capabilities(selected_scopes: list[str], *, mode: str, demo_mode: bool) -> dict[str, object]:
    return {
        "emailRead": any(scope.startswith("gmail://") for scope in selected_scopes),
        "calendarRead": "calendar://primary" in selected_scopes,
        "emailSend": mode == "action-enabled" and not demo_mode,
        "calendarWrite": False,
        "messagingSend": False,
        "demoMode": demo_mode,
    }


def _sync_scope_records(*, connection: IntegrationConnection, workspace, mode: str, selected_scopes: list[str]) -> None:
    allowed_paths: list[str] = []
    for source_path in selected_scopes:
        definition = GOOGLE_SCOPE_DEFINITIONS[source_path]
        allowed_paths.append(source_path)
        DataSourceScope.objects.update_or_create(
            workspace=workspace,
            connection=connection,
            source_path=source_path,
            defaults={
                "display_name": definition.display_name,
                "source_type": definition.source_type,
                "mode": definition.mode if mode == "read-only" else mode,
                "learn_enabled": definition.learn_enabled,
                "is_excluded": not definition.learn_enabled,
            },
        )
    DataSourceScope.objects.filter(connection=connection).exclude(source_path__in=allowed_paths).delete()


def _sync_email_threads(
    *,
    workspace,
    connection: IntegrationConnection,
    account_email: str,
    threads: list[ProviderEmailThread],
) -> int:
    synced_count = 0
    for thread in threads:
        sorted_messages = sorted(thread.messages, key=lambda item: item.sent_at)
        latest_message = sorted_messages[-1] if sorted_messages else None
        latest_sender = _safe_email(latest_message.sender if latest_message else "", fallback=account_email)
        needs_reply = latest_sender != account_email if latest_message and account_email else thread.needs_reply
        waiting_on = "Workspace user" if needs_reply else "Counterparty"
        thread_record, _ = EmailThread.objects.update_or_create(
            workspace=workspace,
            external_id=thread.external_id,
            defaults={
                "provider_source": "google",
                "provider_thread_id": thread.provider_thread_id or thread.external_id,
                "subject": thread.subject[:255],
                "participants": sorted({_safe_email(value) for value in thread.participants if value}),
                "labels": thread.labels,
                "last_message_at": thread.last_message_at,
                "provider_updated_at": thread.provider_updated_at or thread.last_message_at,
                "waiting_on": waiting_on,
                "needs_reply": needs_reply,
                "is_sensitive": thread.is_sensitive,
                "summary": thread.summary,
                "source_url": thread.source_url,
                "status": "active",
                "raw_payload_ref": thread.raw_payload_ref,
                "normalization_version": 1,
            },
        )
        thread_record.messages.all().delete()
        commitments: list[str] = []
        for message in sorted_messages[:8]:
            sender_email = _safe_email(message.sender, fallback=account_email)
            recipients = [
                _safe_email(value, fallback=account_email)
                for value in message.recipients
                if value
            ]
            commitments.extend(message.extracted_commitments)
            EmailMessage.objects.create(
                thread=thread_record,
                provider_message_id=message.provider_message_id,
                sender=sender_email,
                recipients=recipients,
                direction="outbound" if sender_email == account_email else "inbound",
                body=message.body,
                summary=thread.summary,
                labels=message.labels,
                raw_payload_ref=message.raw_payload_ref,
                metadata=message.metadata,
                normalization_version=1,
                extracted_commitments=message.extracted_commitments,
                sent_at=message.sent_at,
            )
            if sender_email != account_email:
                _upsert_contact(
                    workspace=workspace,
                    account_email=account_email,
                    email=sender_email,
                    full_name=_display_name(message.sender),
                    risk_tier="high" if thread.is_sensitive else "normal",
                    last_interaction_at=message.sent_at,
                )
        IngestionEvent.objects.update_or_create(
            workspace=workspace,
            connection=connection,
            source_object_id=thread.external_id,
            defaults={
                "event_type": "gmail.thread.synced",
                "channel": "email",
                "actor_email": account_email,
                "counterparties": thread_record.participants,
                "scope_mode": connection.mode,
                "sensitivity": "sensitive" if thread.is_sensitive else "standard",
                "status": "processed",
                "processed_at": timezone.now(),
                "payload": {
                    "subject": thread.subject,
                    "needsReply": needs_reply,
                    "commitmentCount": len(commitments),
                    "providerThreadId": thread.provider_thread_id or thread.external_id,
                    "labels": thread.labels,
                },
            },
        )
        synced_count += 1
    return synced_count


def _sync_meetings(
    *,
    workspace,
    connection: IntegrationConnection,
    account_email: str,
    meetings: list[ProviderMeeting],
) -> int:
    synced_count = 0
    for meeting in meetings:
        Meeting.objects.update_or_create(
            workspace=workspace,
            external_id=meeting.external_id,
            defaults={
                "provider_source": "google",
                "provider_event_id": meeting.provider_event_id or meeting.external_id,
                "title": meeting.title[:255],
                "organizer": meeting.organizer,
                "starts_at": meeting.starts_at,
                "ends_at": meeting.ends_at,
                "participants": meeting.participants,
                "source_timezone": meeting.source_timezone,
                "meeting_url": meeting.meeting_url,
                "event_status": meeting.event_status,
                "provider_updated_at": meeting.provider_updated_at or meeting.starts_at,
                "priority": "low" if meeting.event_status == "cancelled" else meeting.priority,
                "summary": meeting.summary,
                "raw_payload_ref": meeting.raw_payload_ref,
                "normalization_version": 1,
            },
        )
        IngestionEvent.objects.update_or_create(
            workspace=workspace,
            connection=connection,
            source_object_id=meeting.external_id,
            defaults={
                "event_type": "calendar.event.synced",
                "channel": "calendar",
                "actor_email": account_email,
                "counterparties": meeting.participants,
                "scope_mode": connection.mode,
                "sensitivity": "standard",
                "status": "processed",
                "processed_at": timezone.now(),
                "payload": {
                    "title": meeting.title,
                    "startsAt": meeting.starts_at.isoformat(),
                    "providerEventId": meeting.provider_event_id or meeting.external_id,
                    "status": meeting.event_status,
                },
            },
        )
        synced_count += 1
    return synced_count


def _mark_sync_started(*, connection: IntegrationConnection, sync_mode: str) -> None:
    connection.status = "syncing"
    connection.sync_mode = sync_mode
    connection.last_sync_started_at = timezone.now()
    connection.last_sync_status = "syncing"
    connection.last_sync_error = ""
    connection.last_sync_error_code = ""
    connection.last_sync_error_message = ""
    connection.requires_reauth = False
    connection.save(
        update_fields=[
            "status",
            "sync_mode",
            "last_sync_started_at",
            "last_sync_status",
            "last_sync_error",
            "last_sync_error_code",
            "last_sync_error_message",
            "requires_reauth",
            "updated_at",
        ]
    )


def _mark_sync_success(
    *,
    connection: IntegrationConnection,
    sync_mode: str,
    sync_cursor: dict,
    sync_state: dict,
    last_sync_status: str,
    connection_status: str,
    error_code: str = "",
    error_message: str = "",
) -> None:
    completed_at = timezone.now()
    connection.status = connection_status
    connection.sync_mode = sync_mode
    connection.sync_cursor = sync_cursor
    connection.sync_state = sync_state
    connection.last_sync_completed_at = completed_at
    connection.last_sync_status = last_sync_status
    connection.last_sync_error_code = error_code
    connection.last_sync_error_message = error_message
    connection.last_sync_error = error_message
    connection.last_synced_at = completed_at
    connection.requires_reauth = False
    connection.save(
        update_fields=[
            "status",
            "sync_mode",
            "sync_cursor",
            "sync_state",
            "last_sync_completed_at",
            "last_sync_status",
            "last_sync_error_code",
            "last_sync_error_message",
            "last_sync_error",
            "last_synced_at",
            "requires_reauth",
            "updated_at",
        ]
    )


def _mark_sync_failure(
    *,
    connection: IntegrationConnection,
    connection_status: str,
    last_sync_status: str,
    error_code: str,
    error_message: str,
    requires_reauth: bool = False,
) -> None:
    connection.status = connection_status
    connection.last_sync_status = last_sync_status
    connection.last_sync_error_code = error_code
    connection.last_sync_error_message = error_message[:1000]
    connection.last_sync_error = error_message[:500]
    connection.requires_reauth = requires_reauth
    connection.last_sync_completed_at = timezone.now()
    connection.save(
        update_fields=[
            "status",
            "last_sync_status",
            "last_sync_error_code",
            "last_sync_error_message",
            "last_sync_error",
            "requires_reauth",
            "last_sync_completed_at",
            "updated_at",
        ]
    )


def _display_name(value: str) -> str:
    name, email = parseaddr(value or "")
    if name:
        return name
    if email:
        return email.split("@")[0].replace(".", " ").title()
    return "External contact"


def _safe_email(value: str, *, fallback: str = "unknown@shadowtwin.invalid") -> str:
    _name, email = parseaddr(value or "")
    candidate = email or value
    return candidate if "@" in candidate else fallback


def _upsert_contact(*, workspace, account_email: str, email: str, full_name: str, risk_tier: str, last_interaction_at):
    account_domain = account_email.split("@")[-1] if "@" in account_email else ""
    email_domain = email.split("@")[-1] if "@" in email else ""
    Contact.objects.update_or_create(
        workspace=workspace,
        email=email,
        defaults={
            "full_name": full_name,
            "organization": email_domain,
            "relationship_tier": "active",
            "risk_tier": risk_tier,
            "is_internal": bool(account_domain and account_domain == email_domain),
            "importance_score": 0.92 if risk_tier == "high" else 0.68,
            "last_interaction_at": last_interaction_at,
        },
    )
