from datetime import datetime, UTC

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase

from apps.approvals.models import ApprovalRequest
from apps.meetings.models import Meeting
from apps.recommendations.models import Insight, Recommendation
from apps.twins.models import TwinProfile
from apps.workspaces.models import Membership, Workspace


class TodayFlowTests(APITestCase):
    def setUp(self):
        self.workspace = Workspace.objects.create(
            name="Founder Shadow",
            slug="founder-shadow",
            stage="suggest",
        )
        user_model = get_user_model()
        self.user = user_model.objects.create(
            username="ayo",
            email="ayo@shadowtwin.demo",
            full_name="Ayo Karim",
        )
        self.user.set_password("shadowtwin123")
        self.user.save()
        Membership.objects.create(user=self.user, workspace=self.workspace, role="owner")
        self.twin = TwinProfile.objects.create(
            workspace=self.workspace,
            owner=self.user,
            stage="suggest",
            confidence_score=84,
        )
        Meeting.objects.create(
            workspace=self.workspace,
            external_id="meeting_demo_1",
            title="Daniel Moss / Series A prep",
            starts_at=datetime(2026, 3, 10, 14, 30, tzinfo=UTC),
            participants=["Daniel Moss", "Leila Wong"],
            priority="high",
            summary="Prepared prior objections and open diligence points.",
        )
        Insight.objects.create(
            workspace=self.workspace,
            twin=self.twin,
            title="Follow-up timing is part of your edge",
            detail="You usually send investor follow-ups within two hours.",
            rationale="Based on prior investor meetings.",
            confidence=0.89,
        )
        recommendation = Recommendation.objects.create(
            workspace=self.workspace,
            twin=self.twin,
            recommendation_type="warning",
            title="Three follow-ups may slip today",
            detail="Two sales threads and one candidate recap are at risk.",
            why_visible="Matches your normal cadence.",
            confidence=0.84,
        )
        self.approval = ApprovalRequest.objects.create(
            workspace=self.workspace,
            recommendation=recommendation,
            proposed_action="Approve investor recap draft",
            why_suggested="Prepared from four similar follow-ups in your style.",
            confidence=0.82,
            source_label="Gmail",
            due_label="Before 15:00",
        )
        self.token, _ = Token.objects.get_or_create(user=self.user)

    def test_login_today_and_approval_decision_flow(self):
        login_response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "ayo@shadowtwin.demo", "password": "shadowtwin123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.data["workspaceSlug"], self.workspace.slug)

        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")

        today_response = self.client.get(f"/api/v1/today/{self.workspace.slug}/")
        self.assertEqual(today_response.status_code, 200)
        self.assertEqual(today_response.data["actionQueue"][0]["status"], "approval")

        approvals_response = self.client.get(f"/api/v1/approvals/{self.workspace.slug}/")
        self.assertEqual(approvals_response.status_code, 200)
        self.assertEqual(len(approvals_response.data["items"]), 1)

        decision_response = self.client.post(
            f"/api/v1/approvals/requests/{self.approval.id}/decision/",
            {"decision": "approve"},
            format="json",
        )
        self.assertEqual(decision_response.status_code, 200)
        self.assertEqual(decision_response.data["status"], "approved")

