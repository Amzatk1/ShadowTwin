"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BellDot, Lock, Orbit } from "lucide-react";

import { Badge, Button, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

const roleLabels: Record<string, string> = {
  founder: "Founder / CEO",
  "chief-of-staff": "Chief of Staff / Operator",
  recruiter: "Recruiter / Talent Lead",
  "sales-lead": "Sales / Revenue Lead",
};

export function SettingsWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated, clearSession } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
    clearSession: state.clearSession,
  }));

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: () => apiClient.me(),
    enabled: Boolean(accessToken),
  });

  const onboardingQuery = useQuery({
    queryKey: ["onboarding", workspaceSlug],
    queryFn: () => apiClient.onboarding(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const integrationsQuery = useQuery({
    queryKey: ["integrations", workspaceSlug],
    queryFn: () => apiClient.integrations(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const privacyQuery = useQuery({
    queryKey: ["privacy", workspaceSlug],
    queryFn: () => apiClient.privacy(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications", workspaceSlug],
    queryFn: () => apiClient.notifications(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const auditQuery = useQuery({
    queryKey: ["audit", workspaceSlug],
    queryFn: () => apiClient.audit(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const readNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => apiClient.readNotification(notificationId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["notifications", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["audit", workspaceSlug] }),
      ]);
    },
  });

  if (!hasHydrated) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading settings...</div>;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (
    meQuery.isLoading ||
    onboardingQuery.isLoading ||
    integrationsQuery.isLoading ||
    privacyQuery.isLoading ||
    notificationsQuery.isLoading ||
    auditQuery.isLoading
  ) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading settings...</div>;
  }

  if (
    !meQuery.data ||
    !onboardingQuery.data ||
    !integrationsQuery.data ||
    !privacyQuery.data ||
    !notificationsQuery.data ||
    !auditQuery.data
  ) {
    return (
      <Panel
        title="Settings are unavailable"
        description="The workspace session is present, but the settings data did not load correctly."
      >
        <Button onClick={() => clearSession()} variant="secondary">
          Sign out
        </Button>
      </Panel>
    );
  }

  const unreadNotifications = notificationsQuery.data.items.filter((item) => item.status !== "read");
  const activeIntegrations = integrationsQuery.data.items.filter((item) => item.status === "connected");
  const operatorLabel = roleLabels[onboardingQuery.data.operatorRole] ?? "High-context operator";

  return (
    <div className="space-y-6">
      <Panel
        title="Workspace identity"
        description="ShadowTwin stays founder-first in the product language, but the setup is broad enough for any high-context operator."
        tone="accent"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <Orbit size={16} className="text-accent" />
          {meQuery.data.name} / {operatorLabel}
          <Badge>{onboardingQuery.data.stage}</Badge>
          <Badge>{onboardingQuery.data.minimalModeEnabled ? "minimal mode on" : "minimal mode off"}</Badge>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {onboardingQuery.data.goals.map((goal) => (
            <Badge key={goal} tone="accent">
              {goal}
            </Badge>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button href="/workspace/setup" variant="secondary">
            Update setup
          </Button>
          <Button href="/workspace/integrations" variant="secondary">
            Manage integrations
          </Button>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel
          title="Connected systems"
          description="Provider-first access remains explicit. Read-only mode is the default and action-enabled mode is not required for the MVP."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
              <Lock size={16} className="text-accent" />
              {activeIntegrations.length} active connection{activeIntegrations.length === 1 ? "" : "s"}
              <Badge>{privacyQuery.data.settings.actionDisabledMode ? "actions disabled" : "actions gated"}</Badge>
            </div>
            {integrationsQuery.data.items.length === 0 ? (
              <div className="rounded-2xl border border-line bg-canvas p-4 text-sm leading-6 text-ink-muted">
                No sources are connected yet. Finish setup, then connect Gmail and Google Calendar on web before expecting live Today signals on mobile or desktop.
              </div>
            ) : (
              integrationsQuery.data.items.map((connection) => (
                <div className="rounded-2xl border border-line bg-canvas p-4" key={connection.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-medium text-ink">{connection.displayName}</div>
                      <div className="text-sm text-ink-muted">{connection.accountLabel}</div>
                    </div>
                    <Badge>{connection.mode}</Badge>
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
                    {connection.lastSyncedAt
                      ? `Last sync / ${new Date(connection.lastSyncedAt).toLocaleString()}`
                      : "Awaiting first sync"}
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel
          title="Trust posture"
          description="The product is supposed to feel calm and transparent. These controls keep the twin explainable and scoped."
        >
          <div className="space-y-3">
            <div className="rounded-2xl border border-line bg-canvas p-4">
              <div className="font-medium text-ink">Learning scope</div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">
                {privacyQuery.data.settings.learningEnabled
                  ? "Allowed sources can teach the twin. Excluded sources and do-not-learn items stay out of retrieval and learning."
                  : "Learning is paused for the workspace. ShadowTwin can still show existing records without adapting to new ones."}
              </div>
            </div>
            <div className="rounded-2xl border border-line bg-canvas p-4">
              <div className="font-medium text-ink">Retention and device posture</div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">
                Retention / {privacyQuery.data.settings.retentionDays} days. {privacyQuery.data.settings.localFirstEnabled ? "Local-first behavior is enabled where available." : "The workspace uses standard cloud-backed sync and retention."}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <Button href="/workspace/privacy" variant="secondary">
              Open privacy center
            </Button>
          </div>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
        <Panel
          title="Notifications"
          description="Useful, sparse prompts only. This should feel like a chief of staff surfacing risk, not a noisy alert stream."
        >
          <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
            <BellDot size={16} className="text-accent" />
            {unreadNotifications.length} unread notification{unreadNotifications.length === 1 ? "" : "s"}
          </div>
          <div className="space-y-3">
            {notificationsQuery.data.items.slice(0, 6).map((item) => (
              <div className="rounded-2xl border border-line bg-canvas p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-ink">{item.title}</div>
                    <div className="mt-2 text-sm leading-6 text-ink-muted">{item.body}</div>
                  </div>
                  <Badge>{item.status ?? item.channel}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-ink-muted">
                  <span>{item.channel}</span>
                  <span>{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                {item.status !== "read" ? (
                  <div className="mt-4">
                    <button
                      className="rounded-full border border-line px-3 py-2 text-sm text-ink transition hover:bg-surface disabled:opacity-60"
                      disabled={readNotificationMutation.isPending}
                      onClick={() => readNotificationMutation.mutate(item.id)}
                      type="button"
                    >
                      Mark as read
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Recent audit"
          description="Suggestions, sync activity, and notification changes remain queryable so trust does not depend on memory."
        >
          <div className="space-y-3">
            {auditQuery.data.items.slice(0, 6).map((item) => (
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
          <div className="mt-5">
            <Button onClick={() => clearSession()} variant="secondary">
              Sign out
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
