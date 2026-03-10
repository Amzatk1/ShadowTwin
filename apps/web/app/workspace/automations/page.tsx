import { AutomationsView, WorkspaceShell } from "@/components/site";

export default function AutomationsPage() {
  return (
    <WorkspaceShell
      title="Automations"
      subtitle="Repeatable patterns move from suggestion to trusted automation only with explicit controls, visible triggers, and full audit history."
    >
      <AutomationsView />
    </WorkspaceShell>
  );
}

