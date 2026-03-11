"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, RefreshCcw } from "lucide-react";

import { Badge, Button, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { GoogleConnectPanel } from "@/features/integrations/google-connect-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

const plannedProviders = [
  {
    title: "Outlook and Microsoft 365",
    copy: "Mailbox and calendar parity after Google-first MVP so operators and enterprise users are not blocked on one ecosystem.",
    mode: "planned read-only",
  },
  {
    title: "Slack, Teams, and internal messaging",
    copy: "Selected channels and mentions only, not blanket surveillance. Useful for operators, chiefs of staff, and team leads.",
    mode: "planned scoped read",
  },
  {
    title: "HubSpot, Salesforce, and CRM systems",
    copy: "Relationship memory and follow-up hygiene before any write automation is introduced.",
    mode: "planned read-first",
  },
  {
    title: "Twilio SMS, WhatsApp Business, and voice",
    copy: "Business-provider messaging and calling only. No fake reliance on personal phone app control.",
    mode: "later / approval-gated",
  },
];

function statusTone(status: string): "default" | "accent" | "success" | "warning" | "danger" {
  if (status === "healthy" || status === "connected") {
    return "success";
  }
  if (status === "syncing" || status === "pending-auth" || status === "recovering") {
    return "accent";
  }
  if (status === "reauth-required" || status === "partial-sync" || status === "degraded" || status === "needs_reconnect") {
    return "warning";
  }
  if (status === "sync-failed" || status === "failed") {
    return "danger";
  }
  return "default";
}

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

  const syncMutation = useMutation({
    mutationFn: (connectionId: string) => apiClient.triggerIntegrationSync(connectionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["integrations", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["today", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["feed", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["email-threads", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["meetings-workspace", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["notifications", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["audit", workspaceSlug] }),
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
          title={`${connection.displayName} / ${connection.accountLabel || "Google account pending consent"}`}
          description="Read-only mode is the default. ShadowTwin reads only the scopes you selected, explains what it is using, and never exposes tokens to the client."
          meta={connection.lastSyncedAt ? `Last sync ${new Date(connection.lastSyncedAt).toLocaleString()}` : "Not synced yet"}
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Badge tone={statusTone(connection.status)}>{connection.status}</Badge>
            <Badge tone={statusTone(connection.syncHealthState)}>{connection.syncHealthState.replace("_", " ")}</Badge>
            <Badge>{connection.mode}</Badge>
            <Badge>{connection.syncMode}</Badge>
            {connection.providerEmail ? <Badge>{connection.providerEmail}</Badge> : null}
            {connection.requiresReauth ? <Badge tone="warning">Reconnect needed</Badge> : null}
          </div>
          <div className="mb-4 grid gap-3 rounded-2xl border border-line bg-canvas p-4 text-sm text-ink-muted md:grid-cols-3">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-muted">What is readable</div>
              <div className="mt-2 text-ink">
                {connection.capabilities.emailRead ? "Gmail threads" : "No email scope"}
                {" · "}
                {connection.capabilities.calendarRead ? "Calendar events" : "No calendar scope"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-muted">Granted scopes</div>
              <div className="mt-2 text-ink">
                {connection.grantedScopes.length > 0
                  ? `${connection.grantedScopes.length} Google scopes granted`
                  : "Consent still pending"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-muted">Sync state</div>
              <div className="mt-2 text-ink">
                {typeof connection.syncState.syncedThreadCount === "number"
                  ? `${connection.syncState.syncedThreadCount} threads / ${connection.syncState.syncedMeetingCount ?? 0} meetings`
                  : "Waiting for first sync"}
              </div>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
            <span>Last run / {connection.lastSyncStatus}</span>
            <span>
              Started / {connection.lastSyncStartedAt ? new Date(connection.lastSyncStartedAt).toLocaleString() : "Not yet"}
            </span>
            <span>
              Completed / {connection.lastSyncCompletedAt ? new Date(connection.lastSyncCompletedAt).toLocaleString() : "Pending"}
            </span>
            {connection.lastSyncErrorCode ? <span>Error code / {connection.lastSyncErrorCode}</span> : null}
          </div>
          {connection.lastSyncError ? (
            <div className="mb-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
              {connection.lastSyncError}
            </div>
          ) : null}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Button
              disabled={syncMutation.isPending || connection.status === "pending-auth"}
              onClick={() => syncMutation.mutate(connection.id)}
              variant="secondary"
            >
              {syncMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <RefreshCcw size={16} />}
              Run sync
            </Button>
            <div className="text-sm text-ink-muted">
              Use this to validate bootstrap, incremental refresh, and reconnect handling against real provider state.
            </div>
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {(["read-only", "approval-required"] as const).map((mode) => (
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
          {connection.status === "pending-auth" ? (
            <div className="mb-4 rounded-2xl border border-accent/15 bg-accent-soft px-4 py-3 text-sm text-ink-muted">
              Google consent has started but is not complete yet. Finish the OAuth callback window so ShadowTwin can exchange the code and begin the first live sync.
            </div>
          ) : null}
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
      <Panel
        title="What ShadowTwin will read next"
        description="The product is founder-first, but the integration architecture is meant for any high-context operator. Each expansion stays provider-first and approval-aware."
      >
        <div className="grid gap-4 md:grid-cols-2">
          {plannedProviders.map((provider) => (
            <div className="rounded-2xl border border-line bg-canvas p-4" key={provider.title}>
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-ink">{provider.title}</div>
                <Badge>{provider.mode}</Badge>
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">{provider.copy}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
