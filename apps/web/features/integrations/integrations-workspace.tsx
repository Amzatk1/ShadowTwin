"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Badge, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { GoogleConnectPanel } from "@/features/integrations/google-connect-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

export function IntegrationsWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));

  const integrationsQuery = useQuery({
    queryKey: ["integrations", workspaceSlug],
    queryFn: () => apiClient.integrations(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const modeMutation = useMutation({
    mutationFn: ({
      connectionId,
      mode,
    }: {
      connectionId: string;
      mode: "read-only" | "approval-required" | "action-enabled";
    }) => apiClient.updateIntegrationMode(connectionId, mode),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["integrations", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["privacy", workspaceSlug] }),
      ]);
    },
  });

  const scopeMutation = useMutation({
    mutationFn: ({
      connectionId,
      scopeId,
      excluded,
    }: {
      connectionId: string;
      scopeId: string;
      excluded: boolean;
    }) =>
      apiClient.updateIntegrationScopes(connectionId, [
        {
          id: scopeId,
          excluded,
        },
      ]),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["integrations", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["privacy", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["today", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["feed", workspaceSlug] }),
      ]);
    },
  });

  if (!hasHydrated) {
    return (
      <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">
        Loading workspace session...
      </div>
    );
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (integrationsQuery.isLoading || !integrationsQuery.data) {
    return (
      <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">
        Loading connected tools...
      </div>
    );
  }

  if (integrationsQuery.data.items.length === 0) {
    return <GoogleConnectPanel workspaceSlug={workspaceSlug} />;
  }

  return (
    <div className="space-y-6">
      {integrationsQuery.data.items.map((connection) => (
        <Panel
          key={connection.id}
          title={`${connection.displayName} / ${connection.accountLabel}`}
          description="Read-only mode is the default. You can keep sources connected while excluding them from learning."
          meta={connection.lastSyncedAt ? `Last sync ${new Date(connection.lastSyncedAt).toLocaleString()}` : "Not synced yet"}
        >
          <div className="mb-4 flex flex-wrap gap-2">
            {(["read-only", "approval-required", "action-enabled"] as const).map((mode) => (
              <button
                className="rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-canvas disabled:opacity-60"
                disabled={modeMutation.isPending}
                key={mode}
                onClick={() => modeMutation.mutate({ connectionId: connection.id, mode })}
                type="button"
              >
                {modeMutation.isPending ? <Loader2 className="inline animate-spin" size={14} /> : null}
                <span className="ml-1">{mode}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-3">
            {connection.scopes.map((scope) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={scope.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="font-medium text-ink">{scope.displayName}</div>
                    <div className="text-sm text-ink-muted">{scope.sourcePath}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{scope.mode}</Badge>
                    <button
                      className="rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-surface"
                      disabled={scopeMutation.isPending}
                      onClick={() =>
                        scopeMutation.mutate({
                          connectionId: connection.id,
                          scopeId: scope.id,
                          excluded: !scope.excluded,
                        })
                      }
                      type="button"
                    >
                      {scope.excluded ? "Restore learning" : "Exclude from learning"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      ))}
    </div>
  );
}
