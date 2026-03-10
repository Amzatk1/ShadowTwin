import { notificationExamples } from "../data/sample";
import { RowItem, ScreenContainer, SectionCard } from "../components/ui";

export function SettingsScreen() {
  return (
    <ScreenContainer
      title="Settings"
      subtitle="Privacy controls, integrations, notifications, theme, security, and export or delete actions."
    >
      <SectionCard
        accent
        title="Privacy controls"
        description="Scopes, data retention, local-first behavior, delete or export, and do-not-learn controls stay easy to reach."
      />
      <SectionCard
        title="Notification design"
        description="Pushes should feel useful and calm, never spammy."
      >
        {notificationExamples.map((item) => (
          <RowItem key={item} title={item} detail="Premium, concise, and tied to a clear next action." />
        ))}
      </SectionCard>
      <SectionCard
        title="Security"
        description="Biometric lock, session review, connected tools, and approval policies."
      />
    </ScreenContainer>
  );
}
