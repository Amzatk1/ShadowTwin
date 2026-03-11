"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge, Button, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

export function MeetingsWorkspace() {
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));

  const meetingsQuery = useQuery({
    queryKey: ["meetings-workspace", workspaceSlug],
    queryFn: () => apiClient.meetingsWorkspace(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  if (!hasHydrated) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading meeting intelligence...</div>;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (meetingsQuery.isLoading || !meetingsQuery.data) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading meeting intelligence...</div>;
  }

  if (meetingsQuery.data.items.length === 0) {
    return (
      <Panel
        title="No meeting context yet"
        description="Connect Google Calendar first. Meeting briefs, follow-up suggestions, and later transcript intelligence all build on provider-linked events."
      >
        <Button href="/workspace/integrations" variant="secondary">
          Open integrations
        </Button>
      </Panel>
    );
  }

  const highPriorityCount = meetingsQuery.data.items.filter((meeting) => meeting.priority === "high").length;
  const actionCount = meetingsQuery.data.items.reduce(
    (count, meeting) => count + meeting.extractedActions.length,
    0,
  );
  const nextMeeting = meetingsQuery.data.items[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
      <Panel
        title="Meeting posture"
        description="Meeting intelligence should feel editorial and focused: who matters, what is at stake, and what will probably need follow-up."
        tone="accent"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Upcoming meetings</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{meetingsQuery.data.items.length}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">High priority</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{highPriorityCount}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Actions extracted</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{actionCount}</div>
          </div>
        </div>
        {nextMeeting ? (
          <div className="mt-4 rounded-[24px] border border-line bg-canvas p-4 text-sm leading-6 text-ink-muted">
            Next prep window / {nextMeeting.title} at{" "}
            {new Date(nextMeeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.
          </div>
        ) : null}
      </Panel>
      <Panel
        title="Upcoming meetings"
        description="Prep briefs are grounded in synced calendar data and stay read-only until later approval milestones."
      >
        <div className="space-y-4">
          {meetingsQuery.data.items.map((meeting) => (
            <div className="rounded-[24px] border border-line bg-canvas p-4 shadow-card" key={meeting.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-ink">{meeting.title}</div>
                <div className="flex items-center gap-2">
                  <Badge tone={meeting.priority === "high" ? "danger" : meeting.priority === "medium" ? "warning" : "default"}>
                    {meeting.priority}
                  </Badge>
                  <Badge>{new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</Badge>
                </div>
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">{meeting.summary}</div>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                <span>{meeting.participants.join(" / ")}</span>
              </div>
              {meeting.extractedActions.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {meeting.extractedActions.map((action) => (
                    <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted" key={action}>
                      Action / {action}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="What comes next"
        description="This phase prepares context without overreaching. Transcript summaries and follow-up drafts arrive in the next milestone."
      >
        <div className="space-y-3">
          {[
            "Pre-meeting briefs from calendar, participants, and recent threads.",
            "Post-meeting action extraction once transcripts are ingested.",
            "Approval-gated follow-up drafting rather than silent outbound messaging.",
            "Memory links between people, meetings, and decisions in the next phase.",
          ].map((item) => (
            <div className="rounded-[24px] border border-line bg-canvas p-4 text-sm leading-6 text-ink-muted" key={item}>
              {item}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
