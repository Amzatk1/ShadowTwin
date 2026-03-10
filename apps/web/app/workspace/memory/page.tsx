import { MemoryView, WorkspaceShell } from "@/components/site";

export default function MemoryPage() {
  return (
    <WorkspaceShell
      title="Memory"
      subtitle="Semantic search, linked people and projects, recent captures, and the knowledge graph without turning the UI into a cluttered research tool."
    >
      <MemoryView />
    </WorkspaceShell>
  );
}

