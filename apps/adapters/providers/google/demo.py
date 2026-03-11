from datetime import UTC, datetime

from apps.adapters.providers.common.types import (
    ProviderBundle,
    ProviderEmailMessage,
    ProviderEmailThread,
    ProviderMeeting,
    ProviderMemoryItem,
    ProviderScope,
)


def build_founder_demo_bundle() -> ProviderBundle:
    return ProviderBundle(
        account_label="ayo@shadowtwin.demo",
        scopes=[
            ProviderScope(
                source_path="gmail://label/Inbox",
                display_name="Inbox",
                source_type="gmail-label",
            ),
            ProviderScope(
                source_path="gmail://label/Board",
                display_name="Board and investor threads",
                source_type="gmail-label",
                learn_enabled=False,
            ),
            ProviderScope(
                source_path="calendar://primary",
                display_name="Primary calendar",
                source_type="calendar",
            ),
        ],
        email_threads=[
            ProviderEmailThread(
                external_id="gmail-thread-investor",
                subject="Series A diligence follow-up",
                participants=["daniel@northbridge.vc", "ayo@shadowtwin.demo"],
                last_message_at=datetime(2026, 3, 10, 11, 20, tzinfo=UTC),
                waiting_on="Ayo Karim",
                needs_reply=True,
                is_sensitive=True,
                summary="Investor thread waiting on a concise diligence recap before the afternoon window closes.",
                source_url="https://mail.google.com/mail/u/0/#inbox/gmail-thread-investor",
                messages=[
                    ProviderEmailMessage(
                        sender="daniel@northbridge.vc",
                        recipients=["ayo@shadowtwin.demo"],
                        body="Great conversation. Can you send the two diligence points and customer proof before 15:00?",
                        sent_at=datetime(2026, 3, 10, 11, 20, tzinfo=UTC),
                        extracted_commitments=[
                            "Share two diligence points",
                            "Send customer proof before 15:00",
                        ],
                    )
                ],
            ),
            ProviderEmailThread(
                external_id="gmail-thread-sales",
                subject="Acme expansion next steps",
                participants=["sara@acme.io", "ayo@shadowtwin.demo"],
                last_message_at=datetime(2026, 3, 10, 9, 10, tzinfo=UTC),
                waiting_on="Ayo Karim",
                needs_reply=True,
                is_sensitive=False,
                summary="Expansion prospect is waiting on a recap and proposed next-step call.",
                source_url="https://mail.google.com/mail/u/0/#inbox/gmail-thread-sales",
                messages=[
                    ProviderEmailMessage(
                        sender="sara@acme.io",
                        recipients=["ayo@shadowtwin.demo"],
                        body="Thanks again. Could you send a short recap and two possible slots for next week?",
                        sent_at=datetime(2026, 3, 10, 9, 10, tzinfo=UTC),
                        extracted_commitments=[
                            "Send short recap",
                            "Offer two possible slots for next week",
                        ],
                    )
                ],
            ),
            ProviderEmailThread(
                external_id="gmail-thread-candidate",
                subject="VP Sales interview follow-up",
                participants=["maya.candidate@gmail.com", "ayo@shadowtwin.demo"],
                last_message_at=datetime(2026, 3, 9, 16, 45, tzinfo=UTC),
                waiting_on="Ayo Karim",
                needs_reply=True,
                is_sensitive=True,
                summary="Candidate is waiting on a decision note and next-step timeline after yesterday's interview loop.",
                source_url="https://mail.google.com/mail/u/0/#inbox/gmail-thread-candidate",
                messages=[
                    ProviderEmailMessage(
                        sender="maya.candidate@gmail.com",
                        recipients=["ayo@shadowtwin.demo"],
                        body="Appreciate the time yesterday. Let me know if there is anything else you need from me.",
                        sent_at=datetime(2026, 3, 9, 16, 45, tzinfo=UTC),
                        extracted_commitments=["Share next-step timeline"],
                    )
                ],
            ),
        ],
        meetings=[
            ProviderMeeting(
                external_id="calendar-daniel-moss",
                title="Daniel Moss / Series A prep",
                starts_at=datetime(2026, 3, 10, 14, 30, tzinfo=UTC),
                ends_at=datetime(2026, 3, 10, 15, 15, tzinfo=UTC),
                participants=["Daniel Moss", "Leila Wong"],
                priority="high",
                summary="ShadowTwin prepared objections, diligence asks, and the customer proof points you usually lead with.",
            ),
            ProviderMeeting(
                external_id="calendar-recruiting",
                title="VP Sales debrief",
                starts_at=datetime(2026, 3, 10, 16, 0, tzinfo=UTC),
                ends_at=datetime(2026, 3, 10, 16, 30, tzinfo=UTC),
                participants=["Ayo Karim", "Ria Patel", "Sam Osei"],
                priority="medium",
                summary="Hiring debrief likely ends with a written recommendation and a candidate follow-up within the same day.",
            ),
        ],
        memory_items=[
            ProviderMemoryItem(
                item_type="note",
                title="Daniel Moss diligence notes",
                summary="Keep the answer tight on runway and customer concentration.",
                content="Investor memory / Keep the answer to three points when runway comes up, then move into retention proof.",
                source_label="Google Docs",
                source_object_id="doc-diligence-notes",
            ),
            ProviderMemoryItem(
                item_type="capture",
                title="Acme renewal risk",
                summary="Expansion depends on procurement timing and a short technical review.",
                content="Saved from browser capture / Procurement window lands next Tuesday, so reply timing matters if you want the budget held.",
                source_label="Chrome capture",
                source_object_id="capture-acme-renewal",
            ),
        ],
    )
