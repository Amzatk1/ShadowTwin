from __future__ import annotations

import base64
import binascii
import json
from datetime import UTC, datetime, timedelta
from email.utils import parseaddr, parsedate_to_datetime
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from django.conf import settings

from apps.adapters.providers.common.interfaces import (
    CalendarProviderAdapter,
    EmailProviderAdapter,
    OAuthProviderAdapter,
)
from apps.adapters.providers.common.types import (
    ProviderEmailMessage,
    ProviderEmailThread,
    ProviderMeeting,
)


GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"
GMAIL_THREADS_URL = "https://gmail.googleapis.com/gmail/v1/users/me/threads"
CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"


def _json_request(
    url: str,
    *,
    method: str = "GET",
    data: dict | None = None,
    headers: dict[str, str] | None = None,
) -> dict:
    payload = None
    final_headers = {"Accept": "application/json"}
    if headers:
        final_headers.update(headers)
    if data is not None:
        payload = urlencode(data).encode("utf-8")
        final_headers.setdefault("Content-Type", "application/x-www-form-urlencoded")
    request = Request(url, data=payload, headers=final_headers, method=method)
    try:
        with urlopen(request, timeout=20) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        raise RuntimeError(body or f"google http error {exc.code}") from exc
    except URLError as exc:
        raise RuntimeError(f"google network error: {exc.reason}") from exc


def _header_value(headers: list[dict], name: str, fallback: str = "") -> str:
    lowered = name.lower()
    for header in headers:
        if header.get("name", "").lower() == lowered:
            return header.get("value", fallback)
    return fallback


def _decode_message_body(payload: dict) -> str:
    body = payload.get("body", {})
    if body.get("data"):
        return _decode_data(body["data"])
    for part in payload.get("parts", []):
        part_body = part.get("body", {})
        if part_body.get("data"):
            return _decode_data(part_body["data"])
    return ""


def _decode_data(value: str) -> str:
    if not value:
        return ""
    padded = value + "=" * (-len(value) % 4)
    try:
        return base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8", errors="ignore")
    except (binascii.Error, ValueError):
        return value


def _normalize_email(value: str) -> str:
    _name, email = parseaddr(value or "")
    return email or value


class GoogleOAuthAdapter(OAuthProviderAdapter, EmailProviderAdapter, CalendarProviderAdapter):
    def __init__(self) -> None:
        self.client_id = settings.GOOGLE_CLIENT_ID
        self.client_secret = settings.GOOGLE_CLIENT_SECRET
        self.redirect_uri = settings.GOOGLE_REDIRECT_URI

    def get_auth_url(self, *, state: str, scopes: list[str]) -> str:
        query = urlencode(
            {
                "client_id": self.client_id,
                "redirect_uri": self.redirect_uri,
                "response_type": "code",
                "access_type": "offline",
                "include_granted_scopes": "true",
                "prompt": "consent",
                "scope": " ".join(scopes),
                "state": state,
            }
        )
        return f"{GOOGLE_AUTH_URL}?{query}"

    def exchange_code(self, *, code: str) -> dict:
        return _json_request(
            GOOGLE_TOKEN_URL,
            method="POST",
            data={
                "code": code,
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "redirect_uri": self.redirect_uri,
                "grant_type": "authorization_code",
            },
        )

    def refresh_access_token(self, *, refresh_token: str) -> dict:
        return _json_request(
            GOOGLE_TOKEN_URL,
            method="POST",
            data={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token",
            },
        )

    def fetch_account_profile(self, *, access_token: str) -> dict:
        return _json_request(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
        )

    def fetch_recent_threads(
        self,
        *,
        access_token: str,
        max_results: int = 20,
        sync_state: dict | None = None,
    ) -> tuple[list[ProviderEmailThread], dict]:
        query = urlencode(
            {
                "maxResults": max_results,
                "q": "in:inbox newer_than:14d OR is:unread",
            }
        )
        listing = _json_request(
            f"{GMAIL_THREADS_URL}?{query}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        threads: list[ProviderEmailThread] = []
        highest_history_id = int(sync_state.get("gmailHistoryId", 0)) if sync_state else 0
        for item in listing.get("threads", []):
            detail = _json_request(
                f"{GMAIL_THREADS_URL}/{item['id']}?format=full",
                headers={"Authorization": f"Bearer {access_token}"},
            )
            highest_history_id = max(highest_history_id, int(detail.get("historyId", highest_history_id)))
            messages = []
            participants: set[str] = set()
            latest_timestamp = datetime.now(UTC)
            for message in detail.get("messages", []):
                payload = message.get("payload", {})
                headers = payload.get("headers", [])
                sender = _normalize_email(_header_value(headers, "From"))
                to_value = _header_value(headers, "To")
                recipients = [
                    _normalize_email(value.strip())
                    for value in to_value.split(",")
                    if value.strip()
                ]
                participants.update([sender, *recipients])
                date_header = _header_value(headers, "Date")
                sent_at = (
                    parsedate_to_datetime(date_header).astimezone(UTC)
                    if date_header
                    else datetime.now(UTC)
                )
                latest_timestamp = max(latest_timestamp, sent_at)
                snippet = message.get("snippet", "")
                messages.append(
                    ProviderEmailMessage(
                        sender=sender,
                        recipients=recipients,
                        body=snippet or _decode_message_body(payload),
                        sent_at=sent_at,
                        extracted_commitments=[],
                    )
                )
            subject = _header_value(detail.get("messages", [{}])[0].get("payload", {}).get("headers", []), "Subject", "Gmail thread")
            lowered_subject = subject.lower()
            threads.append(
                ProviderEmailThread(
                    external_id=f"gmail-live-{item['id']}",
                    subject=subject,
                    participants=sorted(filter(None, participants)),
                    last_message_at=latest_timestamp,
                    waiting_on="Workspace user",
                    needs_reply=True,
                    is_sensitive=any(keyword in lowered_subject for keyword in ["board", "investor", "diligence", "legal"]),
                    summary=detail.get("snippet", ""),
                    source_url=f"https://mail.google.com/mail/u/0/#inbox/{item['id']}",
                    messages=messages[:6],
                )
            )
        return threads, {"gmailHistoryId": highest_history_id}

    def fetch_upcoming_events(
        self,
        *,
        access_token: str,
        max_results: int = 20,
        sync_state: dict | None = None,
    ) -> tuple[list[ProviderMeeting], dict]:
        now = datetime.now(UTC)
        query = urlencode(
            {
                "timeMin": now.isoformat(),
                "maxResults": max_results,
                "singleEvents": "true",
                "orderBy": "startTime",
            }
        )
        listing = _json_request(
            f"{CALENDAR_EVENTS_URL}?{query}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        next_sync_token = listing.get("nextSyncToken") or sync_state.get("calendarSyncToken") if sync_state else listing.get("nextSyncToken")
        meetings: list[ProviderMeeting] = []
        for item in listing.get("items", []):
            start_raw = item.get("start", {}).get("dateTime")
            end_raw = item.get("end", {}).get("dateTime")
            if not start_raw:
                continue
            starts_at = datetime.fromisoformat(start_raw.replace("Z", "+00:00")).astimezone(UTC)
            ends_at = (
                datetime.fromisoformat(end_raw.replace("Z", "+00:00")).astimezone(UTC)
                if end_raw
                else starts_at + timedelta(minutes=30)
            )
            participants = [
                attendee.get("email", attendee.get("displayName", "Participant"))
                for attendee in item.get("attendees", [])
            ]
            meetings.append(
                ProviderMeeting(
                    external_id=f"calendar-live-{item['id']}",
                    title=item.get("summary", "Calendar event"),
                    starts_at=starts_at,
                    ends_at=ends_at,
                    participants=participants,
                    priority="high" if item.get("hangoutLink") else "medium",
                    summary=(item.get("description", "") or "Upcoming calendar event pulled from Google Calendar.")[:280],
                )
            )
        return meetings, {"calendarSyncToken": next_sync_token or ""}
