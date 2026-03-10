"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";

import { apiClient } from "@/lib/api";
import { Badge, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { useSessionStore } from "@/stores/session-store";

function LoadingState() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="h-28 animate-pulse rounded-[28px] border border-line bg-surface" key={index} />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-[28px] border border-line bg-surface" />
      </div>
      <div className="space-y-6">
        <div className="h-64 animate-pulse rounded-[28px] border border-line bg-surface" />
        <div className="h-64 animate-pulse rounded-[28px] border border-line bg-surface" />
      </div>
    </div>
  );
}

export function TodayWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated, clearSession } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
    clearSession: state.clearSession,
  }));

  const todayQuery = useQuery({
    queryKey: ["today", workspaceSlug],
    queryFn: () => apiClient.today(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const approvalsQuery = useQuery({
    queryKey: ["approvals", workspaceSlug],
    queryFn: () => apiClient.approvals(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const approvalMutation = useMutation({
    mutationFn: ({
      approvalId,
      decision,
    }: {
      approvalId: string;
      decision: "approve" | "reject" | "snooze";
    }) => apiClient.decideApproval(approvalId, { decision }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["today", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["approvals", workspaceSlug] }),
      ]);
    },
  });

  if (!hasHydrated) {
    return <LoadingState />;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (todayQuery.isError || approvalsQuery.isError) {
    return (
      <Panel
        title="Unable to load workspace"
        description="The API did not return a valid Today or approval payload. Sign out and try again after reseeding the demo."
      >
        <div className="flex gap-3">
          <button
            className="rounded-full border border-line px-4 py-2 text-sm text-ink"
            onClick={() => clearSession()}
            type="button"
          >
            Sign out
          </button>
        </div>
      </Panel>
    );
  }

  if (todayQuery.isLoading || approvalsQuery.isLoading || !todayQuery.data || !approvalsQuery.data) {
    return <LoadingState />;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {todayQuery.data.metrics.map((metric) => (
            <Panel
              description={metric.delta}
              key={metric.label}
              meta={metric.label}
              title={metric.value}
            />
          ))}
        </div>
        <Panel
          title="Action queue"
          description="High-leverage approvals and follow-up risks pulled from the live API."
        >
          <div className="space-y-4">
            {todayQuery.data.actionQueue.map((item) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={item.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-ink">{item.title}</div>
                    <div className="text-sm leading-6 text-ink-muted">{item.description}</div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Badge>{item.status}</Badge>
                    <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">{item.dueLabel}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Meetings today"
          description="Prep and context backed by seeded records instead of static UI fixtures."
        >
          <div className="grid gap-4 md:grid-cols-2">
            {todayQuery.data.meetings.map((meeting) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={meeting.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{meeting.title}</div>
                  <Badge>{meeting.startTime}</Badge>
                </div>
                <div className="mt-2 text-sm leading-6 text-ink-muted">{meeting.summary}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                  People context / {meeting.participants.join(" / ")}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Priority strip" description="The API-driven top items most likely to affect the day.">
          <div className="space-y-3">
            {todayQuery.data.priorities.map((priority) => (
              <div className="rounded-2xl border border-line bg-surface p-4 text-sm text-ink-muted" key={priority}>
                {priority}
              </div>
            ))}
          </div>
        </Panel>
        <Panel
          title="Approval queue"
          description="Approvals are first-class: visible why, confidence, and direct actions."
          tone="accent"
        >
          <div className="space-y-4">
            {approvalsQuery.data.items.map((item) => (
              <div className="rounded-2xl border border-line bg-surface p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-ink">{item.proposedAction}</div>
                    <div className="mt-1 text-sm leading-6 text-ink-muted">{item.whySuggested}</div>
                  </div>
                  <Badge>{item.status}</Badge>
                </div>
                <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
                  <ShieldCheck size={12} />
                  {Math.round(item.confidence * 100)}% confidence / {item.sourceLabel} / {item.dueLabel}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["approve", "snooze", "reject"] as const).map((decision) => (
                    <button
                      className="rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-canvas disabled:opacity-60"
                      disabled={approvalMutation.isPending}
                      key={decision}
                      onClick={() => approvalMutation.mutate({ approvalId: item.id, decision })}
                      type="button"
                    >
                      {approvalMutation.isPending ? <Loader2 className="animate-spin" size={14} /> : null}
                      <span className="ml-1 capitalize">{decision}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Twin insights" description="Insights now come from backend records.">
          <div className="space-y-4">
            {todayQuery.data.insights.map((insight) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={insight.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{insight.title}</div>
                  <div className="text-sm text-accent">{Math.round(insight.confidence * 100)}%</div>
                </div>
                <div className="mt-2 text-sm leading-6 text-ink-muted">{insight.detail}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-muted">{insight.rationale}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

