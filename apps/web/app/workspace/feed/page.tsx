import { WorkspaceShell } from "@/components/site";
import { FeedWorkspace } from "@/features/feed/feed-workspace";

export default function FeedPage() {
  return (
    <WorkspaceShell
      title="Twin Feed"
      subtitle="Chronological observations, suggestions, learned patterns, and workflow opportunities with visible rationale and confidence."
    >
      <FeedWorkspace />
    </WorkspaceShell>
  );
}
