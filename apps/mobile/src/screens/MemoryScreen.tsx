import { memoryItems } from "../data/sample";
import { RowItem, ScreenContainer, SectionCard } from "../components/ui";

export function MemoryScreen() {
  return (
    <ScreenContainer
      title="Memory"
      subtitle="Search notes, voice memos, screenshots, links, and linked entities."
    >
      <SectionCard
        accent
        title="Semantic search"
        description="Find people, projects, meetings, commitments, and captures with context-aware retrieval."
      />
      <SectionCard
        title="Recent captures"
        description="On-the-go input feeds the same memory system used by the web app."
      >
        {memoryItems.map((item) => (
          <RowItem key={item} title={item} detail="Linked to person, project, or meeting context for retrieval later." />
        ))}
      </SectionCard>
    </ScreenContainer>
  );
}
