from decimal import Decimal

from django.utils import timezone

from apps.approvals.models import ApprovalRequest
from apps.audit.models import AuditEvent
from apps.email_intelligence.models import EmailThread
from apps.meetings.models import Meeting
from apps.notifications.models import Notification
from apps.recommendations.models import Insight, Recommendation
from apps.twins.models import TwinProfile

ROLE_FOCUS = {
    "founder": "Protect investor, customer, and hiring follow-through without losing speed.",
    "chief-of-staff": "Protect coordination quality and keep high-context follow-up from slipping.",
    "recruiter": "Protect candidate experience and keep interview loops moving with clean follow-up.",
    "sales-lead": "Protect deal momentum, recap discipline, and next-step clarity.",
}

GOAL_HINTS = {
    "Reduce follow-up drops": "follow-up discipline is one of the clearest product signals right now.",
    "Prepare for meetings faster": "meeting preparation should stay concise and ahead of calendar pressure.",
    "Manage inbox better": "thread triage should stay calm and commitment-aware instead of noisy.",
    "Build a stronger memory layer": "context should be easier to recall before the next decision window.",
    "Spot repeatable workflows": "repeat patterns should be identified before any automation is proposed.",
}


def _quantize_confidence(value: float) -> Decimal:
    bounded = max(0.0, min(value, 0.99))
    return Decimal(f"{bounded:.2f}")


def _hours_since(timestamp) -> float:
    if timestamp is None:
        return 0.0
    return max((timezone.now() - timestamp).total_seconds() / 3600, 0.0)


def _thread_class(thread: EmailThread) -> str:
    subject = thread.subject.lower()
    participants = " ".join(thread.participants).lower()
    if "diligence" in subject or ".vc" in participants or "investor" in subject:
        return "investor"
    if "interview" in subject or "candidate" in subject:
        return "candidate"
    if "sales" in subject or "expansion" in subject or ".io" in participants:
        return "customer"
    if any("@shadowtwin.demo" in participant for participant in thread.participants):
        return "internal"
    return "external"


def _meeting_pressure_score(meeting: Meeting) -> Decimal:
    hours_until = max((meeting.starts_at - timezone.now()).total_seconds() / 3600, 0.0)
    score = 0.62
    if meeting.priority == "high":
        score += 0.2
    elif meeting.priority == "medium":
        score += 0.1
    score += max(0.0, 0.12 - min(hours_until / 24, 0.12))
    if len(meeting.participants) >= 3:
        score += 0.04
    return _quantize_confidence(score)


def _thread_signal(thread: EmailThread) -> dict[str, object]:
    commitments = [
        commitment
        for message in thread.messages.all().order_by("-sent_at")[:3]
        for commitment in message.extracted_commitments
    ]
    score = 0.44
    if thread.needs_reply:
        score += 0.18
    if thread.is_sensitive:
        score += 0.18
    if thread.waiting_on:
        score += 0.06
    score += min(_hours_since(thread.last_message_at) / 36 * 0.12, 0.12)
    score += min(len(commitments) * 0.04, 0.1)
    contact_class = _thread_class(thread)
    if contact_class in {"investor", "candidate"}:
        score += 0.06
    if contact_class == "customer":
        score += 0.04
    confidence = _quantize_confidence(score)
    risk_level = "high" if confidence >= Decimal("0.82") else "medium" if confidence >= Decimal("0.66") else "low"
    return {
        "commitments": commitments,
        "contact_class": contact_class,
        "confidence": confidence,
        "risk_level": risk_level,
        "hours_since": round(_hours_since(thread.last_message_at)),
    }


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

    ApprovalRequest.objects.filter(workspace=workspace, source_label="ShadowTwin").delete()
    Recommendation.objects.filter(workspace=workspace).delete()
    Insight.objects.filter(workspace=workspace).delete()

    threads = list(
        EmailThread.objects.filter(workspace=workspace, status="active")
        .order_by("-last_message_at")[:5]
    )
    meetings = list(
        Meeting.objects.filter(workspace=workspace)
        .exclude(event_status="cancelled")
        .order_by("starts_at")[:3]
    )
    primary_goal = twin.goals[0] if twin.goals else "Reduce follow-up drops"
    role_focus = ROLE_FOCUS.get(twin.operator_role, ROLE_FOCUS["founder"])
    goal_hint = GOAL_HINTS.get(primary_goal, GOAL_HINTS["Reduce follow-up drops"])
    thread_signals = [(thread, _thread_signal(thread)) for thread in threads]
    top_thread = max(thread_signals, key=lambda item: item[1]["confidence"], default=None)
    top_meeting = max(
        ((meeting, _meeting_pressure_score(meeting)) for meeting in meetings),
        key=lambda item: item[1],
        default=None,
    )
    aggregate_confidence = _quantize_confidence(
        (
            sum(float(signal["confidence"]) for _, signal in thread_signals)
            + sum(float(score) for _, score in ([top_meeting] if top_meeting else []))
        )
        / max(len(thread_signals) + (1 if top_meeting else 0), 1)
    )
    twin.confidence_score = aggregate_confidence
    twin.priorities_summary = (
        f"{role_focus} Right now the strongest signal is that {goal_hint}"
    )
    twin.save(update_fields=["confidence_score", "priorities_summary", "updated_at"] if hasattr(twin, "updated_at") else ["confidence_score", "priorities_summary"])

    Insight.objects.update_or_create(
        workspace=workspace,
        twin=twin,
        title="Operating focus is becoming clearer",
        defaults={
            "detail": role_focus,
            "rationale": f"Primary goal / {primary_goal}. ShadowTwin is grounding suggestions in connected email and calendar evidence.",
            "confidence": _quantize_confidence(max(float(aggregate_confidence) - 0.02, 0.7)),
        },
    )
    Insight.objects.update_or_create(
        workspace=workspace,
        twin=twin,
        title="Trust posture is still conservative",
        defaults={
            "detail": (
                "Minimal mode is still protecting the workspace, so the twin is prioritizing explainability and read-only recommendations before action."
                if twin.minimal_mode_enabled
                else "Suggest mode is active, but outbound actions and writes still remain behind approval gates."
            ),
            "rationale": "This keeps the system useful without drifting into silent automation.",
            "confidence": Decimal("0.82"),
        },
    )
    if top_thread is not None:
        thread, signal = top_thread
        Insight.objects.update_or_create(
            workspace=workspace,
            twin=twin,
            title="External follow-up pressure is leading the queue",
            defaults={
                "detail": (
                    f"{signal['contact_class'].title()} thread \"{thread.subject}\" has been waiting about {signal['hours_since']} hours and carries {signal['risk_level']} operational risk."
                ),
                "rationale": "Based on thread age, commitments, sensitivity, and who the conversation is with.",
                "confidence": signal["confidence"],
            },
        )

    for thread, signal in thread_signals:
        commitments = signal["commitments"]
        contact_class = signal["contact_class"]
        risk_level = signal["risk_level"]
        why_visible = (
            f"{contact_class.title()} thread waiting about {signal['hours_since']} hours. "
            f"{goal_hint} {'Sensitive context keeps this approval-gated.' if thread.is_sensitive else 'This still matches a repeatable operating pattern.'}"
        )
        detail = thread.summary
        if commitments:
            detail = f"{thread.summary} Commitments in scope: {', '.join(commitments[:2])}."
        Recommendation.objects.update_or_create(
            workspace=workspace,
            twin=twin,
            title=f"{'Reply risk' if thread.needs_reply else 'Context watch'} / {thread.subject}",
            defaults={
                "recommendation_type": "warning" if thread.needs_reply else "observation",
                "detail": detail,
                "why_visible": why_visible,
                "source_refs": [thread.source_url],
                "risk_level": risk_level,
                "confidence": signal["confidence"],
                "approval_required": True,
                "status": "pending",
                "dismissed_at": None,
            },
        )

    for meeting in meetings:
        meeting_pressure = _meeting_pressure_score(meeting)
        Recommendation.objects.update_or_create(
            workspace=workspace,
            twin=twin,
            title=f"Meeting brief ready / {meeting.title}",
            defaults={
                "recommendation_type": "suggestion",
                "detail": f"{meeting.summary} The brief is tuned for {primary_goal.lower()} and the next likely decision point.",
                "why_visible": "Calendar timing, linked participants, and recent thread context were combined into a prep brief with explicit source traces.",
                "source_refs": [meeting.external_id],
                "risk_level": meeting.priority,
                "confidence": meeting_pressure,
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
                "due_label": "Today / protect reply window",
                "why_suggested": "The queue is showing recurring reply risk across external conversations with real commitments attached, so it is worth reviewing as one calm bundle.",
                "confidence": Decimal("0.81"),
                "status": "pending",
            },
        )

    if top_meeting is not None:
        meeting, _ = top_meeting
        Notification.objects.update_or_create(
            workspace=workspace,
            user=user,
            title=f"Meeting brief ready for {meeting.title}",
            defaults={
                "category": "meeting-brief-ready",
                "channel": "in-app",
                "body": f"Read-only mode prepared a brief for {meeting.title} with participant context and likely follow-up pressure.",
                "status": "queued",
                "action_url": "/workspace/meetings",
            },
        )
    if top_thread is not None:
        thread, signal = top_thread
        Notification.objects.update_or_create(
            workspace=workspace,
            user=user,
            title=f"Reply risk surfaced for {thread.subject}",
            defaults={
                "category": "follow-up-risk",
                "channel": "in-app",
                "body": f"{signal['contact_class'].title()} thread still needs attention and is being held in the queue with explicit rationale.",
                "status": "queued",
                "action_url": "/workspace/email",
            },
        )

    AuditEvent.objects.create(
        workspace=workspace,
        actor=user,
        action_type="recommendation.refresh",
        object_type="workspace",
        object_id=str(workspace.id),
        integration="google",
        metadata={
            "thread_count": len(threads),
            "meeting_count": len(meetings),
            "operator_role": twin.operator_role,
            "primary_goal": primary_goal,
            "confidence": float(aggregate_confidence),
        },
    )
