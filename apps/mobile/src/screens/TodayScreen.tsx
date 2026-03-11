import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import {
  RowItem,
  ScreenContainer,
  SectionCard,
  Chip,
  ToneChip,
} from "../components/ui";
import { apiClient } from "../services/api";
import { useAppStore } from "../store/useAppStore";
import { useSessionStore } from "../store/useSessionStore";
import { palette } from "../theme/tokens";

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

export function TodayScreen() {
  const openCapture = useAppStore((state) => state.openCapture);
  const workspaceSlug = useSessionStore((state) => state.workspaceSlug);

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

  const todayQuery = useQuery({
    queryKey: ["mobile-today", workspaceSlug],
    queryFn: () => apiClient.today(workspaceSlug!),
    enabled: Boolean(
      workspaceSlug &&
        onboardingQuery.data?.completedAt &&
        integrationsQuery.data &&
        integrationsQuery.data.items.length > 0,
    ),
  });

  const approvalsQuery = useQuery({
    queryKey: ["mobile-approvals", workspaceSlug],
    queryFn: () => apiClient.approvals(workspaceSlug!),
    enabled: Boolean(
      workspaceSlug &&
        onboardingQuery.data?.completedAt &&
        integrationsQuery.data &&
        integrationsQuery.data.items.length > 0,
    ),
  });

  const priorities = todayQuery.data?.priorities ?? [];
  const approvals = approvalsQuery.data?.items ?? [];
  const integrations = integrationsQuery.data?.items ?? [];
  const integrationIssues = integrations.filter((item) => item.syncHealthState !== "healthy");
  const connectedSources = integrations.filter((item) => item.status !== "pending-auth").length;

  return (
    <ScreenContainer
      title="Today"
      subtitle="Top priorities, approvals, meeting prep, and what your twin noticed."
      action={
        <Pressable
          onPress={openCapture}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: palette.accent,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Plus color="#FFFFFF" size={20} />
        </Pressable>
      }
    >
      <SectionCard
        accent
        title="What your twin noticed"
        description="ShadowTwin works best once setup is complete and Gmail plus Calendar are connected on web. Until then, mobile stays focused on review posture."
      >
        <Chip label={`Stage / ${todayQuery.data?.twinOverview.stage ?? onboardingQuery.data?.stage ?? "observe"}`} />
        {todayQuery.data?.twinOverview ? (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: palette.text, fontSize: 16, fontWeight: "700" }}>
              {todayQuery.data.twinOverview.prioritiesSummary}
            </Text>
            <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 20, marginTop: 6 }}>
              {Math.round(todayQuery.data.twinOverview.confidenceScore * 100)}% learned confidence / {todayQuery.data.twinOverview.operatorRole} / {todayQuery.data.twinOverview.stage}
            </Text>
          </View>
        ) : null}
        {integrations.length ? (
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            <ToneChip
              label={`${connectedSources} source${connectedSources === 1 ? "" : "s"} connected`}
              tone={connectedSources > 0 ? "success" : "warning"}
            />
            {integrationIssues.length ? (
              <ToneChip
                label={`${integrationIssues.length} source${integrationIssues.length === 1 ? "" : "s"} need attention`}
                tone="warning"
              />
            ) : (
              <ToneChip label="Sync healthy" tone="success" />
            )}
          </View>
        ) : null}
      </SectionCard>
      {integrationIssues.length ? (
        <SectionCard
          title="Connection health"
          description="Today stays useful only if provider sync remains truthful. Reconnect or resync on web when a source drops out of policy or loses access."
        >
          {integrationIssues.map((item) => (
            <View key={item.id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                <ToneChip label={item.displayName} tone="default" />
                <ToneChip label={item.syncHealthState.replace("_", " ")} tone={syncTone(item.syncHealthState)} />
              </View>
              <Text style={{ color: palette.textMuted, fontSize: 13, lineHeight: 20, marginTop: 8 }}>
                {item.lastSyncError
                  ? item.lastSyncError
                  : item.requiresReauth
                    ? "Google needs to be reconnected on web before Today can trust new data."
                    : "This source is still stabilizing after sync. Review the integrations workspace on web for details."}
              </Text>
            </View>
          ))}
        </SectionCard>
      ) : null}
      {!onboardingQuery.data?.completedAt ? (
        <SectionCard
          title="Finish setup on web"
          description="Choose the operator role, initial goals, and whether minimal mode should stay on before the twin starts observing sources."
        >
          <RowItem
            title="Setup required"
            detail="Open the web app, finish Setup, then return here for live priorities and approvals."
          />
        </SectionCard>
      ) : null}
      {onboardingQuery.data?.completedAt && integrationsQuery.data && integrationsQuery.data.items.length === 0 ? (
        <SectionCard
          title="Connect sources on web"
          description="This milestone is provider-first. Connect Gmail and Google Calendar on web in read-only mode to unlock live mobile review."
        >
          <RowItem
            title="No sources connected yet"
            detail="Mobile is intentionally not pretending to control native mail, messages, or phone apps. Connections happen through provider APIs on web first."
          />
        </SectionCard>
      ) : null}
      <SectionCard title="Top priorities" description="A short list designed to reduce context switching.">
        {todayQuery.isLoading ? <RowItem title="Loading priorities" detail="Syncing the live Today view." /> : null}
        {!todayQuery.isLoading && priorities.length === 0 ? (
          <RowItem
            title="Priorities will appear after source sync"
            detail="Once setup is complete and Gmail plus Calendar are connected, the twin will surface follow-up risk, meeting prep, and queue order here."
          />
        ) : null}
        {priorities.map((item) => (
          <RowItem detail="Why you are seeing this / It matches your observed follow-up or meeting cadence." key={item} title={item} />
        ))}
      </SectionCard>
      <SectionCard title="Approval requests" description="Edits remain possible before anything is sent or written.">
        {approvals.length === 0 ? (
          <RowItem
            title="No pending approvals"
            detail="This milestone stays read-only by default, so approvals only appear for review bundles and suggestion handling."
          />
        ) : null}
        {approvals.map((item) => (
          <RowItem key={item.id} title={item.proposedAction} detail={item.whySuggested} />
        ))}
      </SectionCard>
      <View>
        <Text style={{ color: palette.textMuted, fontSize: 13 }}>
          Push examples: "Meeting brief ready for 2:30 PM with Daniel" and "Draft reply prepared in your style".
        </Text>
      </View>
    </ScreenContainer>
  );
}
