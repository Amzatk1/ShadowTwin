import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";

import { RowItem, ScreenContainer, SectionCard } from "../components/ui";
import { apiClient } from "../services/api";
import { useSessionStore } from "../store/useSessionStore";
import { palette, radii, spacing } from "../theme/tokens";

export function MemoryScreen() {
  const queryClient = useQueryClient();
  const workspaceSlug = useSessionStore((state) => state.workspaceSlug);
  const memoryQuery = useQuery({
    queryKey: ["mobile-memory", workspaceSlug],
    queryFn: () => apiClient.memory(workspaceSlug!),
    enabled: Boolean(workspaceSlug),
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
      await queryClient.invalidateQueries({ queryKey: ["mobile-memory", workspaceSlug] });
    },
  });

  return (
    <ScreenContainer
      title="Memory"
      subtitle="Search notes, voice memos, screenshots, links, and linked entities."
    >
      <SectionCard
        accent
        title="Semantic search"
        description="Find people, projects, meetings, commitments, and captures with context-aware retrieval."
      />
      <SectionCard
        title="Recent captures"
        description="On-the-go input feeds the same memory system used by the web app."
      >
        {memoryQuery.isLoading ? (
          <RowItem title="Loading memory" detail="Fetching recent linked context from the API." />
        ) : null}
        {memoryQuery.data?.items.map((item) => (
          <View key={item.id} style={{ marginBottom: spacing.sm }}>
            <RowItem
              title={`${item.title} / ${item.sourceLabel || item.itemType}`}
              detail={item.summary || item.content}
            />
            <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs }}>
              <Pressable
                onPress={() => mutation.mutate({ memoryId: item.id, kind: "hide" })}
                style={{ borderRadius: radii.pill, borderWidth: 1, borderColor: palette.border, paddingVertical: 10, paddingHorizontal: spacing.md }}
              >
                <Text style={{ color: palette.text, fontSize: 13, fontWeight: "600" }}>Hide</Text>
              </Pressable>
              <Pressable
                disabled={!item.learnEnabled || mutation.isPending}
                onPress={() => mutation.mutate({ memoryId: item.id, kind: "exclude-learning" })}
                style={{ borderRadius: radii.pill, borderWidth: 1, borderColor: palette.border, paddingVertical: 10, paddingHorizontal: spacing.md, opacity: item.learnEnabled ? 1 : 0.55 }}
              >
                <Text style={{ color: palette.text, fontSize: 13, fontWeight: "600" }}>
                  {item.learnEnabled ? "Do not learn" : "Learning paused"}
                </Text>
              </Pressable>
            </View>
          </View>
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
