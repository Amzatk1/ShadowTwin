from datetime import datetime, UTC
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from apps.approvals.models import ApprovalRequest
from apps.authn.models import AuthSession
from apps.audit.models import AuditEvent
from apps.email_intelligence.models import Contact, EmailMessage, EmailThread
from apps.ingestion.models import IngestionEvent
from apps.integrations.models import ExternalAccount, IntegrationConnection, OAuthTokenRef
from apps.meetings.models import Meeting
from apps.memory.models import MemoryItem
from apps.notifications.models import Notification
from apps.privacy.models import DataSourceScope, PrivacyPolicySetting
from apps.recommendations.models import Insight, Recommendation
from apps.twins.models import TwinProfile
from apps.workspaces.models import Membership, Workspace


class Command(BaseCommand):
    help = "Seed a realistic founder demo workspace for ShadowTwin"

    def handle(self, *args, **options):
        workspace, _ = Workspace.objects.get_or_create(
            slug="founder-shadow",
            defaults={
                "name": "Founder Shadow",
                "stage": "suggest",
                "approval_mode": "required",
            },
        )
        user_model = get_user_model()
        user, created = user_model.objects.get_or_create(
            email="ayo@shadowtwin.demo",
            defaults={
                "username": "ayo",
                "full_name": "Ayo Karim",
            },
        )
        if created or not user.check_password("shadowtwin123"):
            user.set_password("shadowtwin123")
            user.save(update_fields=["password"])

        Membership.objects.get_or_create(
            user=user,
            workspace=workspace,
            defaults={"role": "owner"},
        )

        for model in (
            ApprovalRequest,
            Recommendation,
            Insight,
            Meeting,
            MemoryItem,
            Notification,
            AuditEvent,
            IngestionEvent,
            DataSourceScope,
            PrivacyPolicySetting,
            OAuthTokenRef,
            ExternalAccount,
            IntegrationConnection,
            EmailMessage,
            EmailThread,
            Contact,
        ):
            queryset = model.objects.filter(workspace=workspace) if hasattr(model, "workspace") else model.objects.none()
            queryset.delete()

        twin, _ = TwinProfile.objects.get_or_create(
            workspace=workspace,
            owner=user,
            defaults={
                "stage": "suggest",
                "confidence_score": Decimal("0.84"),
                "priorities_summary": "Follow-up and meeting preparation are the current high-leverage loops.",
            },
        )
        AuthSession.objects.filter(user=user, workspace=workspace).delete()

        self.stdout.write(self.style.SUCCESS("Seeded demo workspace: founder-shadow"))
        self.stdout.write("Demo login: ayo@shadowtwin.demo / shadowtwin123")
        self.stdout.write(f"Twin profile ready: {twin.id}")
        self.stdout.write("Next step: connect Google in read-only mode from the web Integrations screen.")
