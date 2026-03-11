import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  ActionButton,
  InsightCard,
  RowItem,
  ScreenContainer,
  SectionCard,
} from "../components/ui";
import { apiClient } from "../services/api";
import { useSessionStore } from "../store/useSessionStore";

export function ActionsScreen() {
  const queryClient = useQueryClient();
  const workspaceSlug = useSessionStore((state) => state.workspaceSlug);
  const approvalsQuery = useQuery({
    queryKey: ["mobile-actions", workspaceSlug],
    queryFn: () => apiClient.approvals(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
  });
  const decisionMutation = useMutation({
    mutationFn: ({
      approvalId,
      decision,
    }: {
      approvalId: string;
      decision: "approve" | "reject" | "snooze";
    }) => apiClient.decideApproval(approvalId, { decision }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["mobile-actions", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-today", workspaceSlug] }),
      ]);
    },
  });

  const items = approvalsQuery.data?.items ?? [];
  const pendingCount = items.filter((item) => item.status === "pending").length;

  return (
    <ScreenContainer
      title="Actions"
      subtitle="Drafts awaiting approval, task suggestions, follow-up approvals, and automation requests."
    >
      <SectionCard
        accent
        title="Approval posture"
        description="Actions stay editable and explicit. Mobile is for fast review, not silent execution."
      >
        <RowItem
          title={`${pendingCount} pending approval${pendingCount === 1 ? "" : "s"}`}
          detail="Every action remains tied to confidence, source context, and a clear reason before anything is approved."
        />
      </SectionCard>
      <SectionCard
        title="Pending approvals"
        description="Accept, snooze, dismiss, or edit before approval."
      >
        {approvalsQuery.isLoading ? <RowItem title="Loading approvals" detail="Checking the approval queue." /> : null}
        {!approvalsQuery.isLoading && items.length === 0 ? (
          <RowItem
            title="No approvals waiting"
            detail="This milestone stays mostly read-only. Approvals appear when ShadowTwin bundles review-worthy work or later, when outbound actions are introduced."
          />
        ) : null}
        {items.map((item) => (
          <InsightCard
            key={item.id}
            title={item.proposedAction}
            detail={item.whySuggested}
            meta={`Due / ${item.dueLabel}`}
            chips={[
              { label: item.status, tone: item.status === "approved" ? "success" : item.status === "rejected" ? "danger" : item.status === "snoozed" ? "warning" : "accent" },
              { label: `${Math.round(item.confidence * 100)}% confidence`, tone: "default" },
              { label: item.sourceLabel, tone: "default" },
              ...(item.payloadKind ? [{ label: item.payloadKind.replaceAll("_", " "), tone: "default" as const }] : []),
            ]}
            actions={
              item.status === "pending" ? (
                <>
                  <ActionButton
                    disabled={decisionMutation.isPending}
                    label="Approve"
                    onPress={() => decisionMutation.mutate({ approvalId: item.id, decision: "approve" })}
                    tone="accent"
                  />
                  <ActionButton
                    disabled={decisionMutation.isPending}
                    label="Snooze"
                    onPress={() => decisionMutation.mutate({ approvalId: item.id, decision: "snooze" })}
                  />
                  <ActionButton
                    disabled={decisionMutation.isPending}
                    label="Reject"
                    onPress={() => decisionMutation.mutate({ approvalId: item.id, decision: "reject" })}
                    tone="danger"
                  />
                </>
              ) : undefined
            }
          />
        ))}
      </SectionCard>
      <SectionCard
        title="Automation approvals"
        description="Repeat workflows remain explicit: trigger, actions, confidence, and rollback stay visible."
      >
        <InsightCard
          title="Investor meeting closeout"
          detail="Generate summary, draft follow-up, create diligence tasks, and queue send for approval."
          chips={[
            { label: "planned", tone: "accent" },
            { label: "guarded workflow", tone: "default" },
          ]}
        />
      </SectionCard>
    </ScreenContainer>
  );
}
