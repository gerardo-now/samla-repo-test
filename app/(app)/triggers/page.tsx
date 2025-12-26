import { UI } from "@/lib/copy/uiStrings";
import { TriggersView } from "@/components/triggers/triggers-view";

export default function TriggersPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UI.triggers.title}</h1>
          <p className="text-muted-foreground mt-1">Automatiza acciones basadas en eventos</p>
        </div>
      </div>
      <TriggersView />
    </div>
  );
}

