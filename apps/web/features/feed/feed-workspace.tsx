"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pin, X } from "lucide-react";

import { Badge, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

function riskTone(riskLevel: "high" | "medium" | "low") {
  if (riskLevel === "high") {
    return "danger" as const;
  }
  if (riskLevel === "medium") {
    return "warning" as const;
  }
  return "success" as const;
}

export function FeedWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));

  const feedQuery = useQuery({
    queryKey: ["feed", workspaceSlug],
    queryFn: () => apiClient.feed(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const mutation = useMutation({
    mutationFn: ({
      recommendationId,
      kind,
    }: {
      recommendationId: string;
      kind: "pin" | "dismiss";
    }) =>
      kind === "pin"
        ? apiClient.pinRecommendation(recommendationId)
        : apiClient.dismissRecommendation(recommendationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["feed", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["today", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["audit", workspaceSlug] }),
      ]);
    },
  });

  if (!hasHydrated) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading feed...</div>;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (feedQuery.isLoading || !feedQuery.data) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading feed...</div>;
  }

  const items = feedQuery.data.items;
  const highRiskCount = items.filter((item) => item.riskLevel === "high").length;

  return (
    <div className="space-y-6">
      <Panel
        title="Observation posture"
        description="The feed is meant to explain what the twin noticed, why it matters now, and how much precedent exists behind it."
        tone="accent"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Live signals</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{items.length}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">High risk</div>
            <div className="mt-2 text-2xl font-semibold text-ink">{highRiskCount}</div>
          </div>
          <div className="rounded-[24px] border border-line bg-surface/80 p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">Pinned-ready review</div>
            <div className="mt-2 text-2xl font-semibold text-ink">
              {items.filter((item) => item.kind !== "observation").length}
            </div>
          </div>
        </div>
      </Panel>
      <div className="grid gap-4">
        {items.map((item) => (
          <Panel
            description={item.detail}
            key={item.id}
            meta={`${Math.round(item.confidence * 100)}% confidence`}
            title={item.title}
          >
            <div className="rounded-[24px] border border-line bg-canvas p-4 text-sm leading-6 text-ink-muted">
              Why this was suggested / {item.why}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="accent">{item.kind}</Badge>
              <Badge tone={riskTone(item.riskLevel)}>{item.riskLevel} risk</Badge>
              <Badge>{item.sourceRefs.length} source trace{item.sourceRefs.length === 1 ? "" : "s"}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-surface"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ recommendationId: item.id, kind: "pin" })}
                type="button"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <Pin size={14} />}
                Pin
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-surface"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate({ recommendationId: item.id, kind: "dismiss" })}
                type="button"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <X size={14} />}
                Dismiss
              </button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
