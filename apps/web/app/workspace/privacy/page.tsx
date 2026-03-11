import { WorkspaceShell } from "@/components/site";
import { PrivacyWorkspace } from "@/features/privacy/privacy-workspace";

export default function PrivacyPage() {
  return (
    <WorkspaceShell
      title="Privacy Controls"
      subtitle="Connections, scopes, retention, model behavior, write policies, and deletion or export controls in one serious control center."
    >
      <PrivacyWorkspace />
    </WorkspaceShell>
  );
}
