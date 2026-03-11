import { WorkspaceShell } from "@/components/site";
import { EmailWorkspace } from "@/features/email/email-workspace";

export default function EmailPage() {
  return (
    <WorkspaceShell
      title="Email Intelligence"
      subtitle="Priority threads, waiting-on queues, thread summaries, hidden obligation detection, and user-style drafts held behind approval."
    >
      <EmailWorkspace />
    </WorkspaceShell>
  );
}
