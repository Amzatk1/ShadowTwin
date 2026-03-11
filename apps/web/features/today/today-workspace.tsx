"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Orbit, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { apiClient } from "@/lib/api";
import { Badge, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { GoogleConnectPanel } from "@/features/integrations/google-connect-panel";
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

const roleLabels: Record<string, string> = {
  founder: "Founder / CEO",
  "chief-of-staff": "Chief of Staff / Operator",
  recruiter: "Recruiter / Talent Lead",
  "sales-lead": "Sales / Revenue Lead",
};

function actionStatusTone(status: "approval" | "attention" | "ready") {
  if (status === "ready") {
    return "success" as const;
  }
  if (status === "approval") {
    return "accent" as const;
  }
  return "warning" as const;
}

function meetingTone(priority: string) {
  if (priority === "high") {
    return "danger" as const;
  }
  if (priority === "medium") {
    return "warning" as const;
  }
  return "default" as const;
}

export function TodayWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated, clearSession } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
    clearSession: state.clearSession,
  }));

  const onboardingQuery = useQuery({
    queryKey: ["onboarding", workspaceSlug],
    queryFn: () => apiClient.onboarding(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const integrationsQuery = useQuery({
    queryKey: ["integrations", workspaceSlug],
    queryFn: () => apiClient.integrations(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug && onboardingQuery.data?.completedAt),
  });

  const todayQuery = useQuery({
    queryKey: ["today", workspaceSlug],
    queryFn: () => apiClient.today(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug && integrationsQuery.data?.items.length),
  });

  const approvalsQuery = useQuery({
    queryKey: ["approvals", workspaceSlug],
    queryFn: () => apiClient.approvals(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug && integrationsQuery.data?.items.length),
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

  if (integrationsQuery.isLoading) {
    return <LoadingState />;
  }

  if (onboardingQuery.isLoading) {
    return <LoadingState />;
  }

  if (onboardingQuery.data && !onboardingQuery.data.completedAt) {
    return (
      <Panel
        title="Finish setup before the twin starts observing sources"
        description="Choose the primary operator type, initial goals, and whether minimal mode should stay enabled before you connect Gmail and Calendar."
        tone="accent"
      >
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Orbit size={16} className="text-accent" />
          Founders remain the sharpest default, but the setup flow now supports other high-context users too.
        </div>
        <div className="mt-5">
          <Link className="inline-flex items-center rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white" href="/workspace/setup">
            Open setup
          </Link>
        </div>
      </Panel>
    );
  }

  if (integrationsQuery.isError) {
    return (
      <Panel
        title="Unable to load integrations"
        description="The workspace session is valid but the integration list did not load."
      >
        <button
          className="rounded-full border border-line px-4 py-2 text-sm text-ink"
          onClick={() => clearSession()}
          type="button"
        >
          Sign out
        </button>
      </Panel>
    );
  }

  if (!integrationsQuery.data || integrationsQuery.data.items.length === 0) {
    return (
      <div className="space-y-6">
        <Panel
          title="Founder observe/suggest mode"
          description="Connect Gmail and Calendar in read-only mode first. ShadowTwin will start by surfacing follow-up risk, meeting prep, and explainable priorities."
        >
          <div className="flex items-center gap-3 text-sm text-ink-muted">
            <Orbit size={16} className="text-accent" />
            Best optimized for founders, but usable by any high-context operator who needs a calm execution layer.
          </div>
        </Panel>
        <GoogleConnectPanel workspaceSlug={workspaceSlug} />
      </div>
    );
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

  const operatorLabel = roleLabels[onboardingQuery.data?.operatorRole ?? "founder"] ?? "High-context operator";
  const goals = todayQuery.data.twinOverview.goals.length > 0 ? todayQuery.data.twinOverview.goals : onboardingQuery.data?.goals ?? [];
  const connectedSources = integrationsQuery.data.items.length;
  const unreadApprovals = approvalsQuery.data.items.filter((item) => item.status === "pending").length;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
      <div className="space-y-6">
        <Panel
          title="Operational brief"
          description="A calmer morning brief for the operator, not a dashboard that shouts for attention."
          tone="accent"
        >
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{operatorLabel}</Badge>
            <Badge>{todayQuery.data.twinOverview.stage}</Badge>
            <Badge>{todayQuery.data.twinOverview.minimalModeEnabled ? "minimal mode" : "suggest mode"}</Badge>
            <Badge>{connectedSources} connected source{connectedSources === 1 ? "" : "s"}</Badge>
            <Badge>{Math.round(todayQuery.data.twinOverview.confidenceScore * 100)}% learned confidence</Badge>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1.15fr,0.85fr]">
            <div className="rounded-[24px] border border-line bg-surface/80 p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Focus now</div>
              <div className="mt-3 text-xl font-semibold leading-8 text-ink">
                {todayQuery.data.twinOverview.prioritiesSummary}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {goals.length > 0 ? goals.map((goal) => <Badge key={goal}>{goal}</Badge>) : <Badge>Reduce follow-up drops</Badge>}
              </div>
            </div>
            <div className="rounded-[24px] border border-line bg-canvas p-5">
              <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Trust posture</div>
              <div className="mt-3 text-base font-semibold text-ink">
                {unreadApprovals > 0
                  ? `${unreadApprovals} item${unreadApprovals === 1 ? "" : "s"} waiting for review`
                  : "Observe-first posture is intact"}
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">
                Approvals remain explicit, sources stay provider-first, and outbound actions are still gated behind review.
              </div>
            </div>
          </div>
        </Panel>
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
              <div className="rounded-[24px] border border-line bg-canvas p-4 shadow-card" key={item.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="font-medium text-ink">{item.title}</div>
                    <div className="text-sm leading-6 text-ink-muted">{item.description}</div>
                    <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                      Source / {item.source}
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <Badge tone={actionStatusTone(item.status)}>{item.status}</Badge>
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
              <div className="rounded-[24px] border border-line bg-canvas p-4 shadow-card" key={meeting.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{meeting.title}</div>
                  <div className="flex items-center gap-2">
                    <Badge tone={meetingTone(meeting.priority)}>{meeting.priority}</Badge>
                    <Badge>{meeting.startTime}</Badge>
                  </div>
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
            {todayQuery.data.priorities.map((priority, index) => (
              <div
                className={`rounded-[24px] border p-4 text-sm shadow-card ${index === 0 ? "border-accent/15 bg-accent-soft text-ink" : "border-line bg-surface text-ink-muted"}`}
                key={`${priority}-${index}`}
              >
                <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Priority {index + 1}</div>
                <div className="mt-2 leading-6">{priority}</div>
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
                  <Badge tone={actionStatusTone(item.status === "pending" ? "approval" : item.status === "approved" ? "ready" : "attention")}>{item.status}</Badge>
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
              <div className="rounded-[24px] border border-line bg-canvas p-4 shadow-card" key={insight.id}>
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-ink">{insight.title}</div>
                  <div className="text-sm text-accent">{Math.round(insight.confidence * 100)}%</div>
                </div>
                <div className="mt-2 text-sm leading-6 text-ink-muted">{insight.detail}</div>
                <div className="mt-3 text-xs uppercase tracking-[0.18em] text-ink-muted">Why / {insight.rationale}</div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
