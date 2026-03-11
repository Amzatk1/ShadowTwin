import { WorkspaceShell } from "@/components/site";
import { SetupWorkspace } from "@/features/onboarding/setup-workspace";

export default function WorkspaceSetupPage() {
  return (
    <WorkspaceShell
      title="Setup"
      subtitle="Choose who the twin is for, what it should optimize first, and whether it should stay in minimal mode before any source is connected."
    >
      <SetupWorkspace />
    </WorkspaceShell>
  );
}
