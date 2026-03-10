import { feedItems } from "../data/sample";
import { RowItem, ScreenContainer, SectionCard } from "../components/ui";

export function FeedScreen() {
  return (
    <ScreenContainer
      title="Feed"
      subtitle="A condensed observation stream with suggestions, reminders, and workflow opportunities."
    >
      <SectionCard
        title="Twin Feed"
        description="Each item stays explainable and confidence-aware without overwhelming the interface."
      >
        {feedItems.map((item) => (
          <RowItem key={item.title} title={item.title} detail={item.detail} />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
