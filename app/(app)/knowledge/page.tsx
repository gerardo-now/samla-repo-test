import { UI } from "@/lib/copy/uiStrings";
import { KnowledgeView } from "@/components/knowledge/knowledge-view";

export default function KnowledgePage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UI.knowledge.title}</h1>
          <p className="text-muted-foreground mt-1">Agrega material para que tus agentes respondan con precisión</p>
        </div>
      </div>
      <KnowledgeView />
    </div>
  );
}

