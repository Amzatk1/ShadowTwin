from datetime import timedelta

from django.utils import timezone

from apps.adapters.providers.google.demo import build_founder_demo_bundle
from apps.ai.pipelines.founder_signals import rebuild_founder_signal_layer
from apps.audit.models import AuditEvent
from apps.email_intelligence.models import Contact, EmailMessage, EmailThread
from apps.ingestion.models import IngestionEvent
from apps.integrations.models import ExternalAccount, IntegrationConnection, OAuthTokenRef
from apps.meetings.models import Meeting
from apps.memory.models import MemoryItem
from apps.privacy.models import DataSourceScope, PrivacyPolicySetting
from apps.twins.models import TwinProfile


DEFAULT_SCOPE_PATHS = {
    "gmail://label/Inbox",
    "gmail://label/Board",
    "calendar://primary",
}


def ensure_google_demo_connection(*, workspace, user, mode: str, selected_scopes: list[str] | None):
    bundle = build_founder_demo_bundle()
    selected = set(selected_scopes or DEFAULT_SCOPE_PATHS)
    connection, _ = IntegrationConnection.objects.update_or_create(
        workspace=workspace,
        provider="google",
        account_label=bundle.account_label,
        defaults={
            "display_name": "Google Workspace",
            "mode": mode,
            "status": "connected",
            "metadata": {"demoMode": True},
            "scopes": sorted(selected),
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
            "expires_at": timezone.now() + timedelta(days=30),
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

    allowed_scopes = []
    for scope in bundle.scopes:
        if scope.source_path not in selected:
            continue
        allowed_scopes.append(scope.source_path)
        DataSourceScope.objects.update_or_create(
            workspace=workspace,
            connection=connection,
            source_path=scope.source_path,
            defaults={
                "display_name": scope.display_name,
                "source_type": scope.source_type,
                "mode": scope.mode if mode == "read-only" else mode,
                "learn_enabled": scope.learn_enabled,
                "is_excluded": not scope.learn_enabled,
            },
        )
    DataSourceScope.objects.filter(connection=connection).exclude(source_path__in=allowed_scopes).delete()

    sync_google_demo_connection(connection=connection, workspace=workspace, user=user)
    return connection


def sync_google_demo_connection(*, connection, workspace, user):
    bundle = build_founder_demo_bundle()
    TwinProfile.objects.get_or_create(
        workspace=workspace,
        owner=user,
        defaults={
            "stage": "suggest",
            "confidence_score": 0.84,
            "priorities_summary": "Inbox and calendar observe/suggest mode is active.",
        },
    )

    allowed_scopes = set(connection.scopes or DEFAULT_SCOPE_PATHS)
    connection.last_synced_at = timezone.now()
    connection.save(update_fields=["last_synced_at", "updated_at"])

    for thread in bundle.email_threads:
        if "gmail://label/Inbox" not in allowed_scopes and "gmail://label/Board" not in allowed_scopes:
            continue
        email_thread, _ = EmailThread.objects.update_or_create(
            workspace=workspace,
            external_id=thread.external_id,
            defaults={
                "subject": thread.subject,
                "participants": thread.participants,
                "last_message_at": thread.last_message_at,
                "waiting_on": thread.waiting_on,
                "needs_reply": thread.needs_reply,
                "is_sensitive": thread.is_sensitive,
                "summary": thread.summary,
                "source_url": thread.source_url,
                "status": "active",
            },
        )
        email_thread.messages.all().delete()
        for message in thread.messages:
            EmailMessage.objects.create(
                thread=email_thread,
                sender=message.sender,
                recipients=message.recipients,
                direction="inbound" if message.sender != bundle.account_label else "outbound",
                body=message.body,
                summary=thread.summary,
                extracted_commitments=message.extracted_commitments,
                sent_at=message.sent_at,
            )
            _upsert_contact(
                workspace=workspace,
                email=message.sender,
                full_name=message.sender.split("@")[0].replace(".", " ").title(),
                is_internal=message.sender.endswith("@shadowtwin.demo"),
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
                "actor_email": bundle.account_label,
                "counterparties": thread.participants,
                "scope_mode": connection.mode,
                "sensitivity": "sensitive" if thread.is_sensitive else "standard",
                "status": "processed",
                "processed_at": timezone.now(),
                "payload": {"subject": thread.subject, "needsReply": thread.needs_reply},
            },
        )

    if "calendar://primary" in allowed_scopes:
        for meeting in bundle.meetings:
            Meeting.objects.update_or_create(
                workspace=workspace,
                external_id=meeting.external_id,
                defaults={
                    "title": meeting.title,
                    "starts_at": meeting.starts_at,
                    "ends_at": meeting.ends_at,
                    "participants": meeting.participants,
                    "priority": meeting.priority,
                    "summary": meeting.summary,
                },
            )
            IngestionEvent.objects.update_or_create(
                workspace=workspace,
                connection=connection,
                source_object_id=meeting.external_id,
                defaults={
                    "event_type": "calendar.event.synced",
                    "channel": "calendar",
                    "actor_email": bundle.account_label,
                    "counterparties": meeting.participants,
                    "scope_mode": connection.mode,
                    "sensitivity": "standard",
                    "status": "processed",
                    "processed_at": timezone.now(),
                    "payload": {"title": meeting.title, "startsAt": meeting.starts_at.isoformat()},
                },
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

    rebuild_founder_signal_layer(workspace=workspace, user=user)
    AuditEvent.objects.create(
        workspace=workspace,
        actor=user,
        action_type="integration.google.sync",
        object_type="integration_connection",
        object_id=str(connection.id),
        integration="google",
        metadata={"mode": connection.mode, "scope_count": len(allowed_scopes)},
    )


def _upsert_contact(*, workspace, email, full_name, is_internal, risk_tier, last_interaction_at):
    Contact.objects.update_or_create(
        workspace=workspace,
        email=email,
        defaults={
            "full_name": full_name,
            "organization": email.split("@")[-1],
            "relationship_tier": "active",
            "risk_tier": risk_tier,
            "is_internal": is_internal,
            "importance_score": 0.92 if risk_tier == "high" else 0.68,
            "last_interaction_at": last_interaction_at,
        },
    )
