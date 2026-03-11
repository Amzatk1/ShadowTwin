import { WorkspaceShell } from "@/components/site";
import { SettingsWorkspace } from "@/features/settings/settings-workspace";

export default function SettingsPage() {
  return (
    <WorkspaceShell
      title="Settings"
      subtitle="Workspace preferences, writing style, twin behavior, notifications, theme, data controls, and security configuration."
    >
      <SettingsWorkspace />
    </WorkspaceShell>
  );
}
