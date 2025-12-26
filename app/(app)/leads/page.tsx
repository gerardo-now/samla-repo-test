import { UI } from "@/lib/copy/uiStrings";
import { LeadsView } from "@/components/leads/leads-view";

export default function LeadsPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UI.leads.title}</h1>
          <p className="text-muted-foreground mt-1">Encuentra nuevos prospectos para tu negocio</p>
        </div>
      </div>
      <LeadsView />
    </div>
  );
}

