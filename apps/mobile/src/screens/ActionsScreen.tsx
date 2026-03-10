import { approvals } from "../data/sample";
import { RowItem, ScreenContainer, SectionCard } from "../components/ui";

export function ActionsScreen() {
  return (
    <ScreenContainer
      title="Actions"
      subtitle="Drafts awaiting approval, task suggestions, follow-up approvals, and automation requests."
    >
      <SectionCard
        title="Pending approvals"
        description="Accept, snooze, dismiss, or edit before approval."
      >
        {approvals.map((item) => (
          <RowItem key={item.title} title={item.title} detail={`${item.detail} / Actions available: accept, snooze, dismiss.`} />
        ))}
      </SectionCard>
      <SectionCard
        title="Automation approvals"
        description="Repeat workflows remain explicit: trigger, actions, confidence, and rollback stay visible."
      >
        <RowItem
          title="Investor meeting closeout"
          detail="Generate summary, draft follow-up, create diligence tasks, and queue send for approval."
        />
      </SectionCard>
    </ScreenContainer>
  );
}
