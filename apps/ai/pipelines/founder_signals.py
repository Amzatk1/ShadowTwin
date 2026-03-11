from decimal import Decimal

from apps.approvals.models import ApprovalRequest
from apps.audit.models import AuditEvent
from apps.email_intelligence.models import EmailThread
from apps.meetings.models import Meeting
from apps.notifications.models import Notification
from apps.recommendations.models import Insight, Recommendation
from apps.twins.models import TwinProfile


def rebuild_founder_signal_layer(*, workspace, user):
    twin, _ = TwinProfile.objects.get_or_create(
        workspace=workspace,
        owner=user,
        defaults={
            "stage": "suggest",
            "confidence_score": Decimal("0.84"),
            "priorities_summary": "Read-only observe/suggest mode focused on inbox and calendar.",
        },
    )

    threads = list(
        EmailThread.objects.filter(workspace=workspace, status="active")
        .order_by("-last_message_at")[:5]
    )
    meetings = list(Meeting.objects.filter(workspace=workspace).order_by("starts_at")[:3])

    Insight.objects.update_or_create(
        workspace=workspace,
        twin=twin,
        title="Follow-up timing is part of your edge",
        defaults={
            "detail": "Investor and customer reply rates drop when replies slip beyond the same business day.",
            "rationale": "Based on the Gmail and calendar patterns currently in read-only observation mode.",
            "confidence": Decimal("0.88"),
        },
    )
    Insight.objects.update_or_create(
        workspace=workspace,
        twin=twin,
        title="Recruiting replies are usually batched later in the day",
        defaults={
            "detail": "Candidate updates tend to cluster after your leadership meetings, not before them.",
            "rationale": "Pattern extracted from the current interview and follow-up cadence.",
            "confidence": Decimal("0.76"),
        },
    )

    for thread in threads:
        risk_level = "high" if thread.is_sensitive else "medium"
        why_visible = (
            "Sensitive thread waiting on your reply within your normal same-day window."
            if thread.is_sensitive
            else "This thread matches your usual follow-up cadence and still needs a reply."
        )
        Recommendation.objects.update_or_create(
            workspace=workspace,
            twin=twin,
            title=thread.subject,
            defaults={
                "recommendation_type": "warning" if thread.needs_reply else "observation",
                "detail": thread.summary,
                "why_visible": why_visible,
                "source_refs": [thread.source_url],
                "risk_level": risk_level,
                "confidence": Decimal("0.86") if thread.is_sensitive else Decimal("0.73"),
                "approval_required": True,
                "status": "pending",
                "dismissed_at": None,
            },
        )

    for meeting in meetings:
        Recommendation.objects.update_or_create(
            workspace=workspace,
            twin=twin,
            title=f"Meeting brief ready / {meeting.title}",
            defaults={
                "recommendation_type": "suggestion",
                "detail": meeting.summary,
                "why_visible": "Calendar context, linked participants, and recent email history were combined into a prep brief.",
                "source_refs": [meeting.external_id],
                "risk_level": meeting.priority,
                "confidence": Decimal("0.79"),
                "approval_required": False,
                "status": "pending",
                "dismissed_at": None,
            },
        )

    review_rec = Recommendation.objects.filter(
        workspace=workspace,
        twin=twin,
        recommendation_type="warning",
    ).order_by("-confidence").first()
    if review_rec is not None:
        ApprovalRequest.objects.update_or_create(
            workspace=workspace,
            recommendation=review_rec,
            proposed_action="Review follow-up risk bundle",
            defaults={
                "editable_payload": {
                    "kind": "review_bundle",
                    "thread_ids": [thread.external_id for thread in threads if thread.needs_reply],
                },
                "source_context": {
                    "recommendation_id": review_rec.id,
                    "thread_count": len([thread for thread in threads if thread.needs_reply]),
                },
                "source_label": "ShadowTwin",
                "due_label": "Before 15:00",
                "why_suggested": "The current queue includes one investor, one customer, and one candidate reply risk.",
                "confidence": Decimal("0.81"),
                "status": "pending",
            },
        )

    Notification.objects.update_or_create(
        workspace=workspace,
        user=user,
        title="Meeting brief ready for Daniel Moss",
        defaults={
            "category": "meeting-brief-ready",
            "channel": "in-app",
            "body": "Read-only mode prepared the 14:30 brief with linked diligence context and open loops.",
            "status": "queued",
            "action_url": "/workspace",
        },
    )

    AuditEvent.objects.create(
        workspace=workspace,
        actor=user,
        action_type="recommendation.refresh",
        object_type="workspace",
        object_id=str(workspace.id),
        integration="google",
        metadata={"thread_count": len(threads), "meeting_count": len(meetings)},
    )
