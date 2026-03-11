import { WorkspaceShell } from "@/components/site";
import { MeetingsWorkspace } from "@/features/meetings/meetings-workspace";

export default function MeetingsPage() {
  return (
    <WorkspaceShell
      title="Meetings"
      subtitle="Preparation briefs, people context, transcript summaries, extracted tasks, and follow-up drafting live in one approval-oriented workspace."
    >
      <MeetingsWorkspace />
    </WorkspaceShell>
  );
}
