import { WorkspaceShell } from "@/components/site";
import { IntegrationsWorkspace } from "@/features/integrations/integrations-workspace";

export default function IntegrationsPage() {
  return (
    <WorkspaceShell
      title="Integrations"
      subtitle="Connect Google in read-only mode first, control learning per source, and keep the observe/suggest loop explicit."
    >
      <IntegrationsWorkspace />
    </WorkspaceShell>
  );
}
