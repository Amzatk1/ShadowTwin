import { EmailView, WorkspaceShell } from "@/components/site";

export default function EmailPage() {
  return (
    <WorkspaceShell
      title="Email Intelligence"
      subtitle="Priority threads, waiting-on queues, thread summaries, hidden obligation detection, and user-style drafts held behind approval."
    >
      <EmailView />
    </WorkspaceShell>
  );
}

