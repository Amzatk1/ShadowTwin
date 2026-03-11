"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Loader2, ShieldCheck } from "lucide-react";

import { Badge, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

export function MemoryWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));

  const memoryQuery = useQuery({
    queryKey: ["memory", workspaceSlug],
    queryFn: () => apiClient.memory(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const mutation = useMutation({
    mutationFn: ({
      memoryId,
      kind,
    }: {
      memoryId: string;
      kind: "hide" | "exclude-learning";
    }) =>
      kind === "hide"
        ? apiClient.hideMemory(memoryId)
        : apiClient.excludeMemoryLearning(memoryId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["memory", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["audit", workspaceSlug] }),
      ]);
    },
  });

  if (!hasHydrated) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading memory...</div>;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (memoryQuery.isLoading || !memoryQuery.data) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading memory...</div>;
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
      <Panel
        title="Semantic memory search"
        description="Recent notes, captures, and linked artifacts that the twin can reuse for context and meeting prep."
        tone="accent"
      >
        <div className="space-y-4">
          {memoryQuery.data.items.map((item) => (
            <div className="rounded-2xl border border-line bg-surface p-4" key={item.id}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-ink">{item.title}</div>
                <Badge>{item.sourceLabel || item.itemType}</Badge>
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">{item.summary || item.content}</div>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-canvas"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate({ memoryId: item.id, kind: "hide" })}
                  type="button"
                >
                  {mutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <EyeOff size={14} />}
                  Hide
                </button>
                <button
                  className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-canvas"
                  disabled={mutation.isPending || !item.learnEnabled}
                  onClick={() => mutation.mutate({ memoryId: item.id, kind: "exclude-learning" })}
                  type="button"
                >
                  {mutation.isPending ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />}
                  {item.learnEnabled ? "Do not learn from this" : "Learning paused"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel
        title="How memory is used"
        description="The twin uses memory to ground meeting prep, follow-up suggestions, and relationship context without surfacing excluded sources."
      >
        <div className="space-y-4 text-sm leading-6 text-ink-muted">
          <div className="rounded-2xl border border-line bg-canvas p-4">
            Search is semantic, but retrieval is still filtered by workspace, scope, and exclusion rules.
          </div>
          <div className="rounded-2xl border border-line bg-canvas p-4">
            Hidden items stop resurfacing immediately. Excluded-learning items stay readable if allowed, but they stop teaching the twin.
          </div>
          <div className="rounded-2xl border border-line bg-canvas p-4">
            This milestone keeps memory grounded in Gmail, Calendar, and explicit captures rather than pretending to see everything silently.
          </div>
        </div>
      </Panel>
    </div>
  );
}
