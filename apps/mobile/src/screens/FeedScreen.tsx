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

export function FeedScreen() {
  const queryClient = useQueryClient();
  const workspaceSlug = useSessionStore((state) => state.workspaceSlug);
  const feedQuery = useQuery({
    queryKey: ["mobile-feed", workspaceSlug],
    queryFn: () => apiClient.feed(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
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
        queryClient.invalidateQueries({ queryKey: ["mobile-feed", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["mobile-today", workspaceSlug] }),
      ]);
    },
  });

  const items = feedQuery.data?.items ?? [];
  const highRiskCount = items.filter((item) => item.riskLevel === "high").length;

  return (
    <ScreenContainer
      title="Feed"
      subtitle="A condensed observation stream with suggestions, reminders, and workflow opportunities."
    >
      <SectionCard
        accent
        title="Observation posture"
        description="Signals are ranked by risk, timing, and precedent so mobile review stays brief and useful."
      >
        <RowItem
          title={`${items.length} live signal${items.length === 1 ? "" : "s"} / ${highRiskCount} high risk`}
          detail="Each card explains why it appeared, how strong the signal is, and whether it came from thread or meeting evidence."
        />
      </SectionCard>
      <SectionCard
        title="Twin Feed"
        description="Each item stays explainable and confidence-aware without overwhelming the interface."
      >
        {feedQuery.isLoading ? <RowItem title="Loading feed" detail="Pulling the latest observations from the API." /> : null}
        {!feedQuery.isLoading && items.length === 0 ? (
          <RowItem
            title="No observations yet"
            detail="Complete setup and connect provider sources on web first. The feed will then rank reply risk, meeting prep, and memory cues here."
          />
        ) : null}
        {items.map((item) => (
          <InsightCard
            key={item.id}
            title={item.title}
            detail={item.detail}
            meta={`Why / ${item.why}`}
            chips={[
              { label: item.kind, tone: "accent" },
              { label: `${Math.round(item.confidence * 100)}% confidence`, tone: "default" },
              {
                label: `${item.riskLevel} risk`,
                tone:
                  item.riskLevel === "high"
                    ? "danger"
                    : item.riskLevel === "medium"
                      ? "warning"
                      : "success",
              },
              { label: `${item.sourceRefs.length} source trace${item.sourceRefs.length === 1 ? "" : "s"}`, tone: "default" },
            ]}
            actions={
              <>
                <ActionButton
                  disabled={mutation.isPending}
                  label="Pin"
                  onPress={() => mutation.mutate({ recommendationId: item.id, kind: "pin" })}
                  tone="accent"
                />
                <ActionButton
                  disabled={mutation.isPending}
                  label="Dismiss"
                  onPress={() => mutation.mutate({ recommendationId: item.id, kind: "dismiss" })}
                />
              </>
            }
          />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
