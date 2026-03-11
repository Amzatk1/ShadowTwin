"use client";

import { useQuery } from "@tanstack/react-query";

import { Badge, Button, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

export function EmailWorkspace() {
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));

  const threadsQuery = useQuery({
    queryKey: ["email-threads", workspaceSlug],
    queryFn: () => apiClient.emailThreads(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  if (!hasHydrated) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading inbox intelligence...</div>;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (threadsQuery.isLoading || !threadsQuery.data) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading inbox intelligence...</div>;
  }

  if (threadsQuery.data.items.length === 0) {
    return (
      <Panel
        title="No thread intelligence yet"
        description="Connect Gmail on the Integrations screen first. ShadowTwin stays read-only in this milestone and surfaces triage plus follow-up risk from provider data."
      >
        <Button href="/workspace/integrations" variant="secondary">
          Open integrations
        </Button>
      </Panel>
    );
  }

  const needsReplyCount = threadsQuery.data.items.filter((thread) => thread.needsReply).length;
  const sensitiveCount = threadsQuery.data.items.filter((thread) => thread.isSensitive).length;
  const extractedCommitmentCount = threadsQuery.data.items.reduce(
    (count, thread) => count + thread.extractedCommitments.length,
    0,
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr,0.9fr]">
      <Panel
        title="Inbox posture"
        description="The interface should feel like a chief of staff’s morning pass through the inbox: calm, ranked, and grounded."
        tone="accent"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Needs reply</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{needsReplyCount}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Sensitive threads</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{sensitiveCount}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Commitments found</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{extractedCommitmentCount}</div>
          </div>
        </div>
      </Panel>
      <Panel
        title="Priority threads"
        description="Read-only email intelligence grounded in synced Gmail threads, reply risk, and extracted commitments."
      >
        <div className="space-y-4">
          {threadsQuery.data.items.map((thread) => (
            <div className="rounded-[24px] border border-line bg-canvas p-4 shadow-card" key={thread.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="font-medium text-ink">{thread.subject}</div>
                  <div className="mt-2 text-sm leading-6 text-ink-muted">{thread.summary}</div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {thread.needsReply ? <Badge tone="warning">needs reply</Badge> : <Badge>watching</Badge>}
                  {thread.isSensitive ? <Badge tone="danger">sensitive</Badge> : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                <span>{thread.participants.join(" / ")}</span>
                <span>{thread.messageCount} messages</span>
                <span>
                  {thread.lastMessageAt
                    ? new Date(thread.lastMessageAt).toLocaleString()
                    : "Awaiting thread history"}
                </span>
              </div>
              {thread.extractedCommitments.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {thread.extractedCommitments.map((commitment) => (
                    <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted" key={commitment}>
                      Commitment / {commitment}
                    </div>
                  ))}
                </div>
              ) : null}
              {thread.sourceUrl ? (
                <div className="mt-4">
                  <a
                    className="inline-flex items-center rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-surface"
                    href={thread.sourceUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open source thread
                  </a>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Read-only posture"
        description="Phase 1 reads, explains, and prioritizes. Drafts and sends stay for the approval milestone."
      >
        <div className="space-y-3">
          {[
            "Surface who is waiting on you and why the thread is risky.",
            "Extract commitments before they become dropped follow-ups.",
            "Keep sensitive threads visible without auto-sending anything.",
            "Route outbound email into approval objects later, not silently from native apps.",
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
