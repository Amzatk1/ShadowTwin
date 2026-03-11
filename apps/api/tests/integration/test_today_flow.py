from datetime import datetime, UTC
from decimal import Decimal
from urllib.parse import parse_qs, urlparse
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from apps.adapters.providers.common.types import (
    ProviderEmailMessage,
    ProviderEmailThread,
    ProviderMeeting,
)
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
            confidence_score=Decimal("0.84"),
        )

    def test_login_today_and_approval_decision_flow(self):
        login_response = self.client.post(
            "/api/v1/auth/token/",
            {"email": "ayo@shadowtwin.demo", "password": "shadowtwin123"},
            format="json",
        )
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.data["workspaceSlug"], self.workspace.slug)
        self.assertIn("workspace", login_response.data)

        refresh_response = self.client.post(
            "/api/v1/auth/refresh/",
            {"refreshToken": login_response.data["refreshToken"]},
            format="json",
        )
        self.assertEqual(refresh_response.status_code, 200)

        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {refresh_response.data['accessToken']}"
        )

        onboarding_before_response = self.client.get(
            f"/api/v1/today/setup/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(onboarding_before_response.status_code, 200)
        self.assertIsNone(onboarding_before_response.data["completedAt"])

        onboarding_update_response = self.client.patch(
            "/api/v1/today/setup/",
            {
                "workspaceSlug": self.workspace.slug,
                "operatorRole": "founder",
                "goals": [
                    "Reduce follow-up drops",
                    "Prepare for meetings faster",
                ],
                "minimalModeEnabled": True,
                "stage": "observe",
            },
            format="json",
        )
        self.assertEqual(onboarding_update_response.status_code, 200)
        self.assertEqual(onboarding_update_response.data["operatorRole"], "founder")
        self.assertEqual(onboarding_update_response.data["stage"], "observe")
        self.assertIsNotNone(onboarding_update_response.data["completedAt"])

        connect_response = self.client.post(
            "/api/v1/integrations/google/connect/",
            {
                "workspaceSlug": self.workspace.slug,
                "mode": "read-only",
                "selectedScopes": [
                    "gmail://label/Inbox",
                    "gmail://label/Board",
                    "calendar://primary",
                ],
            },
            format="json",
        )
        self.assertEqual(connect_response.status_code, 200)
        self.assertEqual(connect_response.data["integration"]["provider"], "google")

        today_response = self.client.get(f"/api/v1/today/{self.workspace.slug}/")
        self.assertEqual(today_response.status_code, 200)
        self.assertGreaterEqual(len(today_response.data["meetings"]), 1)

        email_response = self.client.get(
            f"/api/v1/email/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(email_response.status_code, 200)
        self.assertGreaterEqual(len(email_response.data["items"]), 1)
        self.assertIn("extractedCommitments", email_response.data["items"][0])

        meetings_response = self.client.get(
            f"/api/v1/meetings/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(meetings_response.status_code, 200)
        self.assertGreaterEqual(len(meetings_response.data["items"]), 1)
        self.assertIn("startTime", meetings_response.data["items"][0])

        approvals_response = self.client.get(f"/api/v1/approvals/{self.workspace.slug}/")
        self.assertEqual(approvals_response.status_code, 200)
        self.assertEqual(len(approvals_response.data["items"]), 1)
        approval_id = approvals_response.data["items"][0]["id"]

        feed_response = self.client.get(f"/api/v1/feed/{self.workspace.slug}/")
        self.assertEqual(feed_response.status_code, 200)
        self.assertGreaterEqual(len(feed_response.data["items"]), 1)
        recommendation_id = feed_response.data["items"][0]["id"]

        pin_response = self.client.post(f"/api/v1/feed/{recommendation_id}/pin/")
        self.assertEqual(pin_response.status_code, 200)
        self.assertEqual(pin_response.data["status"], "pinned")

        privacy_response = self.client.get(
            f"/api/v1/privacy/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(privacy_response.status_code, 200)
        self.assertGreaterEqual(len(privacy_response.data["controls"]), 1)

        memory_response = self.client.get(
            f"/api/v1/memory/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(memory_response.status_code, 200)
        self.assertGreaterEqual(len(memory_response.data["items"]), 1)
        memory_id = memory_response.data["items"][0]["id"]

        hide_memory_response = self.client.post(f"/api/v1/memory/{memory_id}/hide/")
        self.assertEqual(hide_memory_response.status_code, 200)
        self.assertTrue(hide_memory_response.data["hidden"])

        decision_response = self.client.post(
            f"/api/v1/approvals/requests/{approval_id}/decision/",
            {"decision": "approve"},
            format="json",
        )
        self.assertEqual(decision_response.status_code, 200)
        self.assertEqual(decision_response.data["status"], "approved")

        audit_response = self.client.get(
            f"/api/v1/audit/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(audit_response.status_code, 200)
        self.assertGreaterEqual(len(audit_response.data["items"]), 1)

        notifications_response = self.client.get(
            f"/api/v1/notifications/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(notifications_response.status_code, 200)
        self.assertGreaterEqual(len(notifications_response.data["items"]), 1)
        notification_id = notifications_response.data["items"][0]["id"]

        notification_read_response = self.client.post(
            f"/api/v1/notifications/{notification_id}/read/"
        )
        self.assertEqual(notification_read_response.status_code, 200)
        self.assertEqual(notification_read_response.data["status"], "read")

    @override_settings(
        GOOGLE_CLIENT_ID="test-google-client",
        GOOGLE_CLIENT_SECRET="test-google-secret",
        GOOGLE_REDIRECT_URI="http://localhost:3000/workspace/integrations/google/callback",
    )
    def test_google_connect_returns_live_auth_url_when_oauth_is_configured(self):
        login_response = self.client.post(
            "/api/v1/auth/token/",
            {"email": "ayo@shadowtwin.demo", "password": "shadowtwin123"},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['accessToken']}"
        )

        connect_response = self.client.post(
            "/api/v1/integrations/google/connect/",
            {
                "workspaceSlug": self.workspace.slug,
                "mode": "read-only",
                "selectedScopes": [
                    "gmail://label/Inbox",
                    "calendar://primary",
                ],
            },
            format="json",
        )

        self.assertEqual(connect_response.status_code, 200)
        self.assertFalse(connect_response.data["demoMode"])
        self.assertTrue(connect_response.data["requiresExternalConsent"])
        self.assertIn("accounts.google.com", connect_response.data["authUrl"])
        self.assertEqual(connect_response.data["integration"]["status"], "pending-auth")
        self.assertEqual(connect_response.data["integration"]["grantedScopes"], [])

    @override_settings(
        GOOGLE_CLIENT_ID="test-google-client",
        GOOGLE_CLIENT_SECRET="test-google-secret",
        GOOGLE_REDIRECT_URI="http://localhost:3000/workspace/integrations/google/callback",
    )
    @patch("apps.worker.worker.jobs.ingestion.sync_gmail_threads.delay", side_effect=RuntimeError("queue unavailable"))
    @patch("apps.adapters.providers.google.oauth.GoogleOAuthAdapter.fetch_upcoming_events")
    @patch("apps.adapters.providers.google.oauth.GoogleOAuthAdapter.fetch_recent_threads")
    @patch("apps.adapters.providers.google.oauth.GoogleOAuthAdapter.fetch_account_profile")
    @patch("apps.adapters.providers.google.oauth.GoogleOAuthAdapter.exchange_code")
    def test_google_callback_completes_live_sync_and_populates_today(
        self,
        mock_exchange_code,
        mock_fetch_account_profile,
        mock_fetch_recent_threads,
        mock_fetch_upcoming_events,
        _mock_delay,
    ):
        login_response = self.client.post(
            "/api/v1/auth/token/",
            {"email": "ayo@shadowtwin.demo", "password": "shadowtwin123"},
            format="json",
        )
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {login_response.data['accessToken']}"
        )

        connect_response = self.client.post(
            "/api/v1/integrations/google/connect/",
            {
                "workspaceSlug": self.workspace.slug,
                "mode": "read-only",
                "selectedScopes": [
                    "gmail://label/Inbox",
                    "calendar://primary",
                ],
            },
            format="json",
        )
        state = parse_qs(urlparse(connect_response.data["authUrl"]).query)["state"][0]

        now = datetime.now(UTC)
        mock_exchange_code.return_value = {
            "access_token": "live-access-token",
            "refresh_token": "live-refresh-token",
            "expires_in": 3600,
            "scope": "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly",
            "token_type": "Bearer",
        }
        mock_fetch_account_profile.return_value = {
            "id": "google-user-123",
            "email": "founder@example.com",
            "name": "Founder Example",
        }
        mock_fetch_recent_threads.return_value = (
            [
                ProviderEmailThread(
                    external_id="gmail-live-thread-1",
                    subject="Investor diligence follow-up",
                    participants=["founder@example.com", "partner@alpha.vc"],
                    last_message_at=now,
                    waiting_on="Workspace user",
                    needs_reply=True,
                    is_sensitive=True,
                    summary="Investor thread waiting on a diligence follow-up.",
                    source_url="https://mail.google.com/mail/u/0/#inbox/thread-1",
                    messages=[
                        ProviderEmailMessage(
                            sender="partner@alpha.vc",
                            recipients=["founder@example.com"],
                            body="Can you send the updated numbers today?",
                            sent_at=now,
                            extracted_commitments=["Send updated numbers today"],
                        )
                    ],
                )
            ],
            {"gmailHistoryId": 321},
        )
        mock_fetch_upcoming_events.return_value = (
            [
                ProviderMeeting(
                    external_id="calendar-live-event-1",
                    title="Board prep",
                    starts_at=now,
                    ends_at=now,
                    participants=["founder@example.com", "partner@alpha.vc"],
                    priority="high",
                    summary="Discuss the board packet and fundraising updates.",
                )
            ],
            {"calendarSyncToken": "sync-token-1"},
        )

        callback_response = self.client.post(
            "/api/v1/integrations/google/callback/",
            {"code": "oauth-code", "state": state},
            format="json",
        )

        self.assertEqual(callback_response.status_code, 200)
        self.assertEqual(callback_response.data["integration"]["providerEmail"], "founder@example.com")
        self.assertEqual(callback_response.data["integration"]["status"], "connected")
        self.assertEqual(len(callback_response.data["integration"]["grantedScopes"]), 2)

        today_response = self.client.get(f"/api/v1/today/{self.workspace.slug}/")
        self.assertEqual(today_response.status_code, 200)
        self.assertGreaterEqual(len(today_response.data["meetings"]), 1)

        email_response = self.client.get(
            f"/api/v1/email/?workspaceSlug={self.workspace.slug}"
        )
        self.assertEqual(email_response.status_code, 200)
        self.assertEqual(email_response.data["items"][0]["subject"], "Investor diligence follow-up")
