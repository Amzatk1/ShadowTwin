import { MeetingsView, WorkspaceShell } from "@/components/site";

export default function MeetingsPage() {
  return (
    <WorkspaceShell
      title="Meetings"
      subtitle="Preparation briefs, people context, transcript summaries, extracted tasks, and follow-up drafting live in one approval-oriented workspace."
    >
      <MeetingsView />
    </WorkspaceShell>
  );
}

