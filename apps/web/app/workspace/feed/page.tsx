import { FeedView, WorkspaceShell } from "@/components/site";

export default function FeedPage() {
  return (
    <WorkspaceShell
      title="Twin Feed"
      subtitle="Chronological observations, suggestions, learned patterns, and workflow opportunities with visible rationale and confidence."
    >
      <FeedView />
    </WorkspaceShell>
  );
}

