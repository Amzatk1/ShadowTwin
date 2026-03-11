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
GMAIL_HISTORY_URL = "https://gmail.googleapis.com/gmail/v1/users/me/history"
CALENDAR_EVENTS_URL = "https://www.googleapis.com/calendar/v3/calendars/primary/events"


class GoogleOAuthError(RuntimeError):
    pass


class GoogleReauthRequiredError(GoogleOAuthError):
    pass


class GoogleSyncRecoveryRequiredError(GoogleOAuthError):
    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code


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
        lowered = body.lower()
        if exc.code in {401, 403} and any(
            marker in lowered
            for marker in ["invalid_grant", "login required", "insufficient authentication scopes"]
        ):
            raise GoogleReauthRequiredError(body or "Google authentication is no longer valid.") from exc
        if "starthistoryid" in lowered and ("too old" in lowered or "out of date" in lowered):
            raise GoogleSyncRecoveryRequiredError(
                "gmail_cursor_invalid",
                "Gmail history cursor is no longer valid and needs a bounded recovery sync.",
            ) from exc
        if "sync token" in lowered and ("invalid" in lowered or "expired" in lowered):
            raise GoogleSyncRecoveryRequiredError(
                "calendar_cursor_invalid",
                "Google Calendar sync token is no longer valid and needs a bounded recovery sync.",
            ) from exc
        raise GoogleOAuthError(body or f"google http error {exc.code}") from exc
    except URLError as exc:
        raise GoogleOAuthError(f"google network error: {exc.reason}") from exc


def _header_value(headers: list[dict], name: str, fallback: str = "") -> str:
    lowered = name.lower()
    for header in headers:
        if header.get("name", "").lower() == lowered:
            return header.get("value", fallback)
    return fallback


def _recipient_list(headers: list[dict]) -> list[str]:
    values: list[str] = []
    for name in ("To", "Cc"):
        value = _header_value(headers, name)
        if not value:
            continue
        values.extend(
            [
                _normalize_email(item.strip())
                for item in value.split(",")
                if item.strip()
            ]
        )
    return [value for value in values if value]


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


def _iso_to_datetime(value: str | None) -> datetime | None:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00")).astimezone(UTC)


def _thread_sensitivity(subject: str, labels: list[str]) -> bool:
    lowered_subject = subject.lower()
    lowered_labels = {label.lower() for label in labels}
    return any(keyword in lowered_subject for keyword in ["board", "investor", "diligence", "legal"]) or any(
        label in lowered_labels for label in {"important", "starred"}
    )


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
        state = sync_state or {}
        history_id = state.get("gmailHistoryId")
        if history_id:
            return self._fetch_incremental_threads(
                access_token=access_token,
                history_id=str(history_id),
                max_results=max_results,
            )
        return self._fetch_bootstrap_threads(access_token=access_token, max_results=max_results)

    def fetch_upcoming_events(
        self,
        *,
        access_token: str,
        max_results: int = 20,
        sync_state: dict | None = None,
    ) -> tuple[list[ProviderMeeting], dict]:
        state = sync_state or {}
        sync_token = state.get("calendarSyncToken")
        if sync_token:
            return self._fetch_incremental_events(
                access_token=access_token,
                sync_token=str(sync_token),
            )
        return self._fetch_bootstrap_events(access_token=access_token, max_results=max_results)

    def _fetch_bootstrap_threads(
        self,
        *,
        access_token: str,
        max_results: int,
    ) -> tuple[list[ProviderEmailThread], dict]:
        query = urlencode(
            {
                "maxResults": max_results,
                "q": "(in:inbox newer_than:21d) OR (is:unread newer_than:30d)",
            }
        )
        listing = _json_request(
            f"{GMAIL_THREADS_URL}?{query}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        thread_ids = [item["id"] for item in listing.get("threads", [])][:max_results]
        threads, highest_history_id = self._hydrate_threads(
            access_token=access_token,
            thread_ids=thread_ids,
        )
        return threads, {
            "gmailHistoryId": str(highest_history_id or 0),
            "gmailSyncMode": "incremental",
            "gmailSyncWindow": "recent-21d",
        }

    def _fetch_incremental_threads(
        self,
        *,
        access_token: str,
        history_id: str,
        max_results: int,
    ) -> tuple[list[ProviderEmailThread], dict]:
        query = urlencode(
            {
                "startHistoryId": history_id,
                "maxResults": max_results,
            }
        )
        listing = _json_request(
            f"{GMAIL_HISTORY_URL}?{query}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        thread_ids: list[str] = []
        latest_history_id = int(history_id)
        for item in listing.get("history", []):
            latest_history_id = max(latest_history_id, int(item.get("id", latest_history_id)))
            for key in ("messages", "messagesAdded", "messagesDeleted"):
                values = item.get(key, [])
                for entry in values:
                    message = entry.get("message", entry) if isinstance(entry, dict) else {}
                    thread_id = message.get("threadId")
                    if thread_id:
                        thread_ids.append(thread_id)
        unique_thread_ids = sorted(set(thread_ids))
        threads, highest_history_id = self._hydrate_threads(
            access_token=access_token,
            thread_ids=unique_thread_ids[:max_results],
        )
        return threads, {
            "gmailHistoryId": str(max(latest_history_id, highest_history_id or latest_history_id)),
            "gmailSyncMode": "incremental",
        }

    def _hydrate_threads(
        self,
        *,
        access_token: str,
        thread_ids: list[str],
    ) -> tuple[list[ProviderEmailThread], int]:
        threads: list[ProviderEmailThread] = []
        highest_history_id = 0
        for thread_id in thread_ids:
            try:
                detail = _json_request(
                    f"{GMAIL_THREADS_URL}/{thread_id}?format=full",
                    headers={"Authorization": f"Bearer {access_token}"},
                )
            except GoogleOAuthError as exc:
                if "not found" in str(exc).lower():
                    continue
                raise
            highest_history_id = max(highest_history_id, int(detail.get("historyId", 0)))
            messages: list[ProviderEmailMessage] = []
            participants: set[str] = set()
            labels: set[str] = set()
            latest_timestamp = datetime.now(UTC)
            latest_updated = datetime.now(UTC)
            for message in detail.get("messages", []):
                payload = message.get("payload", {})
                headers = payload.get("headers", [])
                sender = _normalize_email(_header_value(headers, "From"))
                recipients = _recipient_list(headers)
                participants.update([sender, *recipients])
                message_labels = message.get("labelIds", [])
                labels.update(message_labels)
                internal_date = message.get("internalDate")
                sent_at = (
                    datetime.fromtimestamp(int(internal_date) / 1000, tz=UTC)
                    if internal_date
                    else (
                        parsedate_to_datetime(_header_value(headers, "Date")).astimezone(UTC)
                        if _header_value(headers, "Date")
                        else datetime.now(UTC)
                    )
                )
                latest_timestamp = max(latest_timestamp, sent_at)
                latest_updated = max(latest_updated, sent_at)
                snippet = message.get("snippet", "")
                messages.append(
                    ProviderEmailMessage(
                        sender=sender,
                        recipients=recipients,
                        body=snippet or _decode_message_body(payload),
                        sent_at=sent_at,
                        provider_message_id=message.get("id", ""),
                        labels=message_labels,
                        raw_payload_ref=f"gmail-message:{message.get('id', '')}",
                        metadata={"threadId": thread_id, "historyId": detail.get("historyId")},
                        extracted_commitments=[],
                    )
                )
            subject = _header_value(
                detail.get("messages", [{}])[0].get("payload", {}).get("headers", []),
                "Subject",
                "Gmail thread",
            )
            threads.append(
                ProviderEmailThread(
                    external_id=f"gmail-live-{thread_id}",
                    subject=subject,
                    participants=sorted(filter(None, participants)),
                    last_message_at=latest_timestamp,
                    waiting_on="Workspace user",
                    needs_reply=True,
                    is_sensitive=_thread_sensitivity(subject, list(labels)),
                    summary=detail.get("snippet", ""),
                    source_url=f"https://mail.google.com/mail/u/0/#inbox/{thread_id}",
                    messages=messages[:8],
                    provider_thread_id=thread_id,
                    labels=sorted(labels),
                    raw_payload_ref=f"gmail-thread:{thread_id}",
                    provider_updated_at=latest_updated,
                )
            )
        return threads, highest_history_id

    def _fetch_bootstrap_events(
        self,
        *,
        access_token: str,
        max_results: int,
    ) -> tuple[list[ProviderMeeting], dict]:
        now = datetime.now(UTC)
        query = urlencode(
            {
                "timeMin": (now - timedelta(days=7)).isoformat(),
                "timeMax": (now + timedelta(days=30)).isoformat(),
                "maxResults": max_results,
                "singleEvents": "true",
                "showDeleted": "true",
                "orderBy": "startTime",
            }
        )
        listing = _json_request(
            f"{CALENDAR_EVENTS_URL}?{query}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        return self._normalize_events(listing), {
            "calendarSyncToken": listing.get("nextSyncToken", ""),
            "calendarSyncMode": "incremental",
            "calendarSyncWindow": "7d-back-30d-forward",
        }

    def _fetch_incremental_events(
        self,
        *,
        access_token: str,
        sync_token: str,
    ) -> tuple[list[ProviderMeeting], dict]:
        query = urlencode(
            {
                "syncToken": sync_token,
                "showDeleted": "true",
            }
        )
        listing = _json_request(
            f"{CALENDAR_EVENTS_URL}?{query}",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        return self._normalize_events(listing), {
            "calendarSyncToken": listing.get("nextSyncToken", sync_token),
            "calendarSyncMode": "incremental",
        }

    def _normalize_events(self, listing: dict) -> list[ProviderMeeting]:
        meetings: list[ProviderMeeting] = []
        for item in listing.get("items", []):
            start_info = item.get("start", {})
            end_info = item.get("end", {})
            status = item.get("status", "confirmed")
            start_raw = start_info.get("dateTime") or item.get("originalStartTime", {}).get("dateTime")
            end_raw = end_info.get("dateTime")
            starts_at = _iso_to_datetime(start_raw) or _iso_to_datetime(item.get("updated")) or datetime.now(UTC)
            ends_at = _iso_to_datetime(end_raw) or (starts_at + timedelta(minutes=30))
            organizer = item.get("organizer", {}).get("email", "")
            attendees = [
                attendee.get("email", attendee.get("displayName", "Participant"))
                for attendee in item.get("attendees", [])
            ]
            participants = sorted({organizer, *attendees} - {""})
            meetings.append(
                ProviderMeeting(
                    external_id=f"calendar-live-{item['id']}",
                    title=item.get("summary", "Calendar event"),
                    starts_at=starts_at,
                    ends_at=ends_at,
                    participants=participants,
                    priority="high" if item.get("hangoutLink") else "medium",
                    summary=(item.get("description", "") or "Calendar event pulled from Google Calendar.")[:280],
                    provider_event_id=item.get("id", ""),
                    organizer=organizer,
                    source_timezone=start_info.get("timeZone", end_info.get("timeZone", "UTC")),
                    meeting_url=item.get("hangoutLink") or item.get("htmlLink", ""),
                    event_status=status,
                    raw_payload_ref=f"calendar-event:{item.get('id', '')}",
                    provider_updated_at=_iso_to_datetime(item.get("updated")),
                )
            )
        return meetings
