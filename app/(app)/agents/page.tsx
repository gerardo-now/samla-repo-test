import { UI } from "@/lib/copy/uiStrings";
import { AgentsView } from "@/components/agents/agents-view";

export default function AgentsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UI.agents.title}</h1>
          <p className="text-muted-foreground mt-1">Crea y configura agentes de IA</p>
        </div>
      </div>
      <AgentsView />
    </div>
  );
}

