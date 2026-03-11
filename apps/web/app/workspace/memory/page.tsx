import { WorkspaceShell } from "@/components/site";
import { MemoryWorkspace } from "@/features/memory/memory-workspace";

export default function MemoryPage() {
  return (
    <WorkspaceShell
      title="Memory"
      subtitle="Semantic search, linked people and projects, recent captures, and the knowledge graph without turning the UI into a cluttered research tool."
    >
      <MemoryWorkspace />
    </WorkspaceShell>
  );
}
