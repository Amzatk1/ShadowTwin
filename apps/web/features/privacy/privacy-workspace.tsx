"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";

import { Badge, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

export function PrivacyWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));

  const privacyQuery = useQuery({
    queryKey: ["privacy", workspaceSlug],
    queryFn: () => apiClient.privacy(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const auditQuery = useQuery({
    queryKey: ["audit", workspaceSlug],
    queryFn: () => apiClient.audit(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const privacyMutation = useMutation({
    mutationFn: (nextLearningEnabled: boolean) =>
      apiClient.updatePrivacy({
        workspaceSlug: workspaceSlug!,
        learningEnabled: nextLearningEnabled,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["privacy", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["audit", workspaceSlug] }),
      ]);
    },
  });

  if (!hasHydrated) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading privacy controls...</div>;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (privacyQuery.isLoading || auditQuery.isLoading || !privacyQuery.data || !auditQuery.data) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading privacy controls...</div>;
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Workspace privacy posture"
        description="Privacy is visible and mutable from the product surface, not hidden in setup."
        tone="accent"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <ShieldCheck size={16} className="text-accent" />
          Retention / {privacyQuery.data.settings.retentionDays} days
          <Badge>{privacyQuery.data.settings.localFirstEnabled ? "local-first on" : "local-first off"}</Badge>
          <Badge>{privacyQuery.data.settings.actionDisabledMode ? "actions disabled" : "actions gated"}</Badge>
        </div>
        <div className="mt-4">
          <button
            className="rounded-full border border-line px-4 py-2 text-sm text-ink transition hover:bg-surface"
            disabled={privacyMutation.isPending}
            onClick={() => privacyMutation.mutate(!privacyQuery.data.settings.learningEnabled)}
            type="button"
          >
            {privacyMutation.isPending ? <Loader2 className="inline animate-spin" size={14} /> : null}
            <span className="ml-1">
              {privacyQuery.data.settings.learningEnabled ? "Pause learning" : "Resume learning"}
            </span>
          </button>
        </div>
      </Panel>

      <Panel
        title="Connected scope controls"
        description="Each scope shows how it is used, whether it can teach the twin, and what remains excluded."
      >
        <div className="space-y-4">
          {privacyQuery.data.controls.map((control) => (
            <div className="grid gap-4 rounded-2xl border border-line bg-canvas p-4 md:grid-cols-[1fr,1fr,0.7fr,0.7fr]" key={control.id}>
              <div className="font-medium text-ink">{control.name}</div>
              <div className="text-sm text-ink-muted">{control.scope}</div>
              <div className="text-sm text-ink-muted">
                {control.learnEnabled ? "Learning enabled" : "Learning paused"}
              </div>
              <div className="flex justify-start md:justify-end">
                <Badge>{control.excluded ? "excluded" : control.mode}</Badge>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Audit trail"
        description="Every sync, recommendation refresh, and privacy change remains queryable."
      >
        <div className="space-y-3">
          {auditQuery.data.items.map((item) => (
            <div className="rounded-2xl border border-line bg-canvas p-4" key={item.id}>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="font-medium text-ink">{item.actionType}</div>
                <div className="text-xs uppercase tracking-[0.18em] text-ink-muted">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="mt-2 text-sm text-ink-muted">
                {item.objectType} / {item.integration || "shadowtwin"}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
