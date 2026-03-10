import { TodayView, WorkspaceShell } from "@/components/site";

export default function WorkspacePage() {
  return (
    <WorkspaceShell
      title="Today"
      subtitle="A calm command center for priorities, follow-up risk, meeting preparation, drafts awaiting approval, and recent twin learning."
    >
      <TodayView />
    </WorkspaceShell>
  );
}

