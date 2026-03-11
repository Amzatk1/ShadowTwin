import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";

import { ActionButton, RowItem, ScreenContainer, SectionCard, ToneChip } from "../components/ui";
import { apiClient } from "../services/api";
import { useSessionStore } from "../store/useSessionStore";
import { palette, radii, spacing } from "../theme/tokens";

function syncTone(syncHealthState: string): "default" | "accent" | "success" | "warning" | "danger" {
  if (syncHealthState === "healthy") {
    return "success";
  }
  if (syncHealthState === "syncing" || syncHealthState === "recovering") {
    return "accent";
  }
  if (syncHealthState === "degraded" || syncHealthState === "idle") {
    return "warning";
  }
  if (syncHealthState === "failed" || syncHealthState === "needs_reconnect") {
    return "danger";
  }
  return "default";
}

export function SettingsScreen() {
  const queryClient = useQueryClient();
  const { workspaceSlug, clearSession } = useSessionStore((state) => ({
    workspaceSlug: state.workspaceSlug,
    clearSession: state.clearSession,
  }));
  const onboardingQuery = useQuery({
    queryKey: ["mobile-onboarding", workspaceSlug],
    queryFn: () => apiClient.onboarding(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
  });
  const integrationsQuery = useQuery({
    queryKey: ["mobile-integrations", workspaceSlug],
    queryFn: () => apiClient.integrations(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
  });
  const privacyQuery = useQuery({
    queryKey: ["mobile-privacy", workspaceSlug],
    queryFn: () => apiClient.privacy(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
  });
  const notificationsQuery = useQuery({
    queryKey: ["mobile-notifications", workspaceSlug],
    queryFn: () => apiClient.notifications(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
  });
  const syncMutation = useMutation({
    mutationFn: (connectionId: string) => apiClient.triggerIntegrationSync(connectionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mobile-integrations", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-today", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-feed", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-approvals", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-memory", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-notifications", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-email", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-meetings", workspaceSlug] }),
      ]);
    },
  });
  const unhealthyConnections = integrationsQuery.data?.items.filter(
    (item) => item.syncHealthState !== "healthy",
  ) ?? [];

  return (
    <ScreenContainer
      title="Settings"
      subtitle="Privacy controls, integrations, notifications, theme, security, and export or delete actions."
    >
      <SectionCard
        accent
        title="Workspace profile"
        description="Founder-first by default, but usable by other high-context operators once setup reflects their role and goals."
      >
        <RowItem
          title={`Role / ${onboardingQuery.data?.operatorRole ?? "founder"}`}
          detail={
            onboardingQuery.data?.goals?.length
              ? `Current goals: ${onboardingQuery.data.goals.join(", ")}`
              : "Finish setup on web to define the first goals ShadowTwin should optimize for."
          }
        />
        <RowItem
          title={onboardingQuery.data?.minimalModeEnabled ? "Minimal mode enabled" : "Minimal mode disabled"}
          detail="Minimal mode keeps the twin in an observe-first posture until you are ready for a fuller suggestion queue."
        />
      </SectionCard>
      <SectionCard
        title="Connected systems"
        description="Connections are provider-first and server-side. Mobile is for review, not for silent native app control."
      >
        {unhealthyConnections.length ? (
          <View style={{ marginBottom: spacing.md, gap: spacing.sm }}>
            <ToneChip
              label={`${unhealthyConnections.length} source${unhealthyConnections.length > 1 ? "s" : ""} need review`}
              tone="warning"
            />
            <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 20 }}>
              Sync health now reflects real provider state. Reconnect or resync on web if a source keeps degrading or loses scope access.
            </Text>
          </View>
        ) : null}
        {integrationsQuery.isLoading ? (
          <RowItem title="Loading connections" detail="Checking Gmail, Calendar, and other provider-linked sources." />
        ) : null}
        {integrationsQuery.data?.items.length ? (
          integrationsQuery.data.items.map((item) => (
            <View
              key={item.id}
              style={{
                borderRadius: radii.md,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.surfaceMuted,
                padding: spacing.md,
                marginBottom: spacing.sm,
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
                <ToneChip label={item.syncHealthState.replace("_", " ")} tone={syncTone(item.syncHealthState)} />
                <ToneChip label={item.mode.replace("-", " ")} tone="default" />
                {item.requiresReauth ? <ToneChip label="Reconnect needed" tone="danger" /> : null}
              </View>
              <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700" }}>
                {item.displayName}
              </Text>
              <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 20 }}>
                {item.providerEmail || item.accountLabel}
              </Text>
              <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 20 }}>
                {item.lastSyncCompletedAt
                  ? `Last sync ${new Date(item.lastSyncCompletedAt).toLocaleString()} / ${item.lastSyncStatus}`
                  : `Sync state / ${item.lastSyncStatus}`}
              </Text>
              <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 20 }}>
                {item.syncMode === "bootstrap"
                  ? "Bootstrap sync imports a bounded recent window first."
                  : item.syncMode === "incremental"
                    ? "Incremental sync keeps Today fresh without replaying the full inbox or calendar."
                    : `Sync mode / ${item.syncMode}`}
              </Text>
              {item.lastSyncError ? (
                <Text style={{ color: palette.danger, fontSize: 13, lineHeight: 20 }}>
                  {item.lastSyncErrorCode ? `${item.lastSyncErrorCode} / ` : ""}
                  {item.lastSyncError}
                </Text>
              ) : null}
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                <ActionButton
                  disabled={
                    item.status === "pending-auth" ||
                    syncMutation.isPending
                  }
                  label={
                    syncMutation.isPending
                      ? "Running sync..."
                      : item.requiresReauth
                        ? "Reconnect on web"
                        : "Run sync"
                  }
                  onPress={() => {
                    if (!item.requiresReauth) {
                      syncMutation.mutate(item.id);
                    }
                  }}
                  tone={item.requiresReauth ? "danger" : "accent"}
                />
              </View>
            </View>
          ))
        ) : (
          <RowItem
            title="No sources connected"
            detail="Connect Gmail and Google Calendar on web first. Outlook, Slack or Teams, CRM, and business messaging come next through provider integrations."
          />
        )}
      </SectionCard>
      <SectionCard
        accent
        title="Privacy controls"
        description="Scopes, data retention, local-first behavior, delete or export, and do-not-learn controls stay easy to reach."
      >
        <RowItem
          title={`Retention / ${privacyQuery.data?.settings.retentionDays ?? 90} days`}
          detail={privacyQuery.data?.settings.learningEnabled ? "Learning enabled for allowed scopes." : "Learning paused at the workspace level."}
        />
      </SectionCard>
      <SectionCard
        title="Notification design"
        description="Pushes should feel useful and calm, never spammy."
      >
        {notificationsQuery.isLoading ? (
          <RowItem title="Loading notifications" detail="Pulling the live in-app notification history." />
        ) : null}
        {(notificationsQuery.data?.items.length ? notificationsQuery.data.items : [
          {
            id: "fallback-1",
            title: "Meeting brief ready for 2:30 PM with Daniel",
            body: "Premium, concise, and tied to a clear next action.",
          },
          {
            id: "fallback-2",
            title: "Three follow-ups may slip before 17:00",
            body: "Risk-based notification designed for review, not noise.",
          },
        ]).map((item) => (
          <RowItem key={item.id} title={item.title} detail={item.body} />
        ))}
      </SectionCard>
      <SectionCard
        title="Security"
        description="Biometric lock, session review, connected tools, and approval policies."
      >
        <RowItem title="Sign out" detail="Remove the mobile session and require a fresh login." />
      </SectionCard>
      <Pressable onPress={() => void clearSession()} style={{ borderRadius: radii.pill, backgroundColor: palette.surface, paddingVertical: 14, paddingHorizontal: spacing.lg }}>
        <Text style={{ color: palette.text, fontSize: 15, fontWeight: "700", textAlign: "center" }}>Sign out</Text>
      </Pressable>
    </ScreenContainer>
  );
}
