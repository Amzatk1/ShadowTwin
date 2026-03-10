from app.schemas.domain import (
    ActionQueueItem,
    AutomationResponse,
    FeedResponse,
    MeetingBrief,
    PrivacyControl,
    PrivacyResponse,
    TodayMetric,
    TodayResponse,
    TwinInsight,
    TwinObservation,
    WorkflowSuggestion,
)


def get_today_snapshot() -> TodayResponse:
    return TodayResponse(
        metrics=[
            TodayMetric(label="Follow-ups prevented", value="12", delta="+3 this week"),
            TodayMetric(label="Meetings prepped", value="5", delta="100% ready today"),
            TodayMetric(label="Hours saved", value="7.4", delta="Projected this week"),
            TodayMetric(label="Draft acceptance", value="84%", delta="Style confidence rising"),
        ],
        priorities=[
            "Investor follow-up window closes at 15:00",
            "Hiring panel brief is missing one scorecard",
            "Three CRM updates can be approved in one pass",
        ],
        action_queue=[
            ActionQueueItem(
                id="action_1",
                title="Approve investor recap draft",
                description="Generated from your last four fundraising follow-ups with an 82% tone match.",
                status="approval",
                source="Gmail",
                dueLabel="Before 15:00",
            ),
            ActionQueueItem(
                id="action_2",
                title="Review tasks extracted from hiring sync",
                description="ShadowTwin found five next steps and one owner mismatch in Linear.",
                status="attention",
                source="Meeting memory",
                dueLabel="Today",
            ),
        ],
        meetings=[
            MeetingBrief(
                id="meeting_1",
                title="Daniel Moss / Series A prep",
                startTime="14:30",
                participants=["Daniel Moss", "Leila Wong"],
                priority="high",
                summary="Twin prepared a fundraising brief with prior investor objections, open diligence points, and a proposed follow-up sequence.",
            )
        ],
        insights=[
            TwinInsight(
                id="insight_1",
                title="Follow-up timing is part of your edge",
                detail="You usually send investor follow-ups within two hours, and reply rates drop when you wait until the next morning.",
                confidence=0.89,
                rationale="Based on 14 similar meetings across six weeks.",
                createdAt="2026-03-10T08:10:00Z",
            )
        ],
    )


def get_feed() -> FeedResponse:
    return FeedResponse(
        items=[
            TwinObservation(
                id="feed_1",
                kind="warning",
                title="Three follow-ups may slip today",
                detail="Two sales threads and one candidate recap are at risk based on your usual cadence.",
                confidence=0.84,
                why="These threads match past obligations that you typically close within one business day.",
                createdAt="09:12",
            ),
            TwinObservation(
                id="feed_2",
                kind="pattern",
                title="ShadowTwin learned your meeting brief format",
                detail="Briefs now prioritize people context, open loops, and one decisive question instead of full transcripts.",
                confidence=0.91,
                why="Derived from your last nine edits to meeting preparation notes.",
                createdAt="08:44",
            ),
        ]
    )


def get_privacy_controls() -> PrivacyResponse:
    return PrivacyResponse(
        controls=[
            PrivacyControl(
                id="privacy_1",
                name="Gmail",
                scope="Inbox metadata, thread content, draft approval",
                mode="approval-required",
                retention="90-day rolling sync",
            ),
            PrivacyControl(
                id="privacy_2",
                name="Google Calendar",
                scope="Event titles, attendees, notes, prep briefs",
                mode="read-only",
                retention="Workspace default",
            ),
        ]
    )


def get_workflow_suggestions() -> AutomationResponse:
    return AutomationResponse(
        suggestions=[
            WorkflowSuggestion(
                id="workflow_1",
                title="Investor meeting closeout",
                trigger="After investor meeting ends",
                actions=[
                    "Generate decision-ready summary",
                    "Draft follow-up in your style",
                    "Create diligence tasks",
                    "Queue send for approval",
                ],
                confidence=0.86,
            )
        ]
    )
