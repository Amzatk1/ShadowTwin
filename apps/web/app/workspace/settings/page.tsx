import { SettingsView, WorkspaceShell } from "@/components/site";

export default function SettingsPage() {
  return (
    <WorkspaceShell
      title="Settings"
      subtitle="Workspace preferences, writing style, twin behavior, notifications, theme, data controls, and security configuration."
    >
      <SettingsView />
    </WorkspaceShell>
  );
}
