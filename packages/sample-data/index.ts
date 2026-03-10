import type {
  ActionItem,
  MeetingBrief,
  PrivacyControl,
  TwinInsight,
  TwinObservation,
  UserProfile,
  WorkflowSuggestion,
} from "@shadowtwin/shared-types";

export const currentUser: UserProfile = {
  id: "user_01",
  name: "Ayo Karim",
  role: "Founder",
  workspaceId: "ws_shadow",
};

export const todayMetrics = [
  { label: "Follow-ups prevented", value: "12", delta: "+3 this week" },
  { label: "Meetings prepped", value: "5", delta: "100% ready today" },
  { label: "Hours saved", value: "7.4", delta: "Projected this week" },
  { label: "Draft acceptance", value: "84%", delta: "Style confidence rising" },
];

export const priorityStrip = [
  "Investor follow-up window closes at 15:00",
  "Hiring panel brief is missing one scorecard",
  "Three CRM updates can be approved in one pass",
];

export const actionQueue: ActionItem[] = [
  {
    id: "action_1",
    title: "Approve investor recap draft",
    description: "Generated from your last four fundraising follow-ups with an 82% tone match.",
    status: "approval",
    source: "Gmail",
    dueLabel: "Before 15:00",
  },
  {
    id: "action_2",
    title: "Review tasks extracted from hiring sync",
    description: "ShadowTwin found five next steps and one owner mismatch in Linear.",
    status: "attention",
    source: "Meeting memory",
    dueLabel: "Today",
  },
  {
    id: "action_3",
    title: "Enable post-sales-call workflow",
    description: "Summary, CRM update, recap draft, and next-step scheduling are ready for approval.",
    status: "ready",
    source: "Automation suggestion",
    dueLabel: "Any time",
  },
];

export const meetings: MeetingBrief[] = [
  {
    id: "meeting_1",
    title: "Daniel Moss / Series A prep",
    startTime: "14:30",
    participants: ["Daniel Moss", "Leila Wong"],
    priority: "high",
    summary: "Twin prepared a fundraising brief with prior investor objections, open diligence points, and a proposed follow-up sequence.",
  },
  {
    id: "meeting_2",
    title: "Ops review / Candidate debrief",
    startTime: "16:00",
    participants: ["Hiring panel", "Chief of Staff"],
    priority: "medium",
    summary: "One rubric gap remains. ShadowTwin can draft the final decision memo after the call.",
  },
];

export const insights: TwinInsight[] = [
  {
    id: "insight_1",
    title: "Follow-up timing is part of your edge",
    detail: "You usually send investor follow-ups within two hours, and reply rates drop when you wait until the next morning.",
    confidence: 0.89,
    rationale: "Based on 14 similar meetings across six weeks.",
    createdAt: "2026-03-10T08:10:00Z",
  },
  {
    id: "insight_2",
    title: "Friday internal notes are often deprioritized",
    detail: "Internal ops notes are frequently delayed or left uncategorized after 16:00 on Fridays.",
    confidence: 0.76,
    rationale: "Observed across Notion capture and Slack reminders.",
    createdAt: "2026-03-09T17:00:00Z",
  },
];

export const feed: TwinObservation[] = [
  {
    id: "feed_1",
    kind: "warning",
    title: "Three follow-ups may slip today",
    detail: "Two sales threads and one candidate recap are at risk based on your usual cadence.",
    confidence: 0.84,
    why: "These threads match past obligations that you typically close within one business day.",
    createdAt: "09:12",
  },
  {
    id: "feed_2",
    kind: "pattern",
    title: "ShadowTwin learned your meeting brief format",
    detail: "Briefs now prioritize people context, open loops, and one decisive question instead of full transcripts.",
    confidence: 0.91,
    why: "Derived from your last nine edits to meeting preparation notes.",
    createdAt: "08:44",
  },
  {
    id: "feed_3",
    kind: "suggestion",
    title: "A repeat hiring workflow can be automated",
    detail: "Interview summary, rubric extraction, and decision memo drafting now follow a stable sequence.",
    confidence: 0.79,
    why: "Detected after five similar recruiting loops in the last month.",
    createdAt: "Yesterday",
  },
];

export const privacyControls: PrivacyControl[] = [
  {
    id: "privacy_1",
    name: "Gmail",
    scope: "Inbox metadata, thread content, draft approval",
    mode: "approval-required",
    retention: "90-day rolling sync",
  },
  {
    id: "privacy_2",
    name: "Google Calendar",
    scope: "Event titles, attendees, notes, prep briefs",
    mode: "read-only",
    retention: "Workspace default",
  },
  {
    id: "privacy_3",
    name: "HubSpot",
    scope: "Contacts, deals, meeting updates",
    mode: "approval-required",
    retention: "Selective sync: Revenue team only",
  },
];

export const workflows: WorkflowSuggestion[] = [
  {
    id: "workflow_1",
    title: "Investor meeting closeout",
    trigger: "After investor meeting ends",
    actions: [
      "Generate decision-ready summary",
      "Draft follow-up in your style",
      "Create diligence tasks",
      "Queue send for approval",
    ],
    confidence: 0.86,
  },
  {
    id: "workflow_2",
    title: "Post-sales-call orchestration",
    trigger: "After Zoom call with opportunity owner",
    actions: [
      "Update CRM fields",
      "Prepare recap email",
      "Schedule next step",
      "Log objections in memory",
    ],
    confidence: 0.81,
  },
];

export const memorySnippets = [
  "Voice memo: keep investor answers to three clear points when runway is under discussion.",
  "Bookmark: Daniel Moss partner memo notes from prior diligence thread.",
  "Screenshot capture: competitor pricing page attached to GTM project.",
];
