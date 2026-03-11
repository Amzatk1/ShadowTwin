from datetime import datetime, UTC

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

from apps.approvals.models import ApprovalRequest
from apps.authn.models import AuthSession
from apps.meetings.models import Meeting
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
        twin, _ = TwinProfile.objects.get_or_create(
            workspace=workspace,
            owner=user,
            defaults={
                "stage": "suggest",
                "confidence_score": 84,
                "priorities_summary": "Follow-up and meeting preparation are the current high-leverage loops.",
            },
        )
        meeting, _ = Meeting.objects.get_or_create(
            workspace=workspace,
            external_id="meeting_demo_1",
            defaults={
                "title": "Daniel Moss / Series A prep",
                "starts_at": datetime(2026, 3, 10, 14, 30, tzinfo=UTC),
                "participants": ["Daniel Moss", "Leila Wong"],
                "priority": "high",
                "summary": "ShadowTwin prepared prior objections, open diligence points, and a proposed closeout sequence.",
            },
        )
        insight, _ = Insight.objects.get_or_create(
            workspace=workspace,
            twin=twin,
            title="Follow-up timing is part of your edge",
            defaults={
                "detail": "You usually send investor follow-ups within two hours, and reply rates drop when you wait until the next morning.",
                "rationale": "Based on 14 similar meetings across six weeks.",
                "confidence": 0.89,
            },
        )
        recommendation, _ = Recommendation.objects.get_or_create(
            workspace=workspace,
            twin=twin,
            title="Three follow-ups may slip today",
            defaults={
                "recommendation_type": "warning",
                "detail": "Two sales threads and one candidate recap are at risk based on your usual cadence.",
                "why_visible": "These threads match past obligations that you typically close within one business day.",
                "confidence": 0.84,
                "approval_required": True,
                "status": "pending",
            },
        )
        approval, _ = ApprovalRequest.objects.get_or_create(
            workspace=workspace,
            recommendation=recommendation,
            proposed_action="Approve investor recap draft",
            defaults={
                "editable_payload": {
                    "draft": "Daniel, great speaking earlier. I wanted to close the loop on the diligence points we discussed..."
                },
                "source_context": {
                    "meeting_id": meeting.id,
                    "insight_id": insight.id,
                },
                "source_label": "Gmail",
                "due_label": "Before 15:00",
                "why_suggested": "Prepared from four similar follow-ups in your style.",
                "confidence": 0.82,
                "status": "pending",
            },
        )
        AuthSession.objects.filter(user=user, workspace=workspace).delete()

        self.stdout.write(self.style.SUCCESS("Seeded demo workspace: founder-shadow"))
        self.stdout.write("Demo login: ayo@shadowtwin.demo / shadowtwin123")
        self.stdout.write(f"Primary approval id: {approval.id}")
