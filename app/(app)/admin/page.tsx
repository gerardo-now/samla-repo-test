import { UI } from "@/lib/copy/uiStrings";
import { AdminView } from "@/components/admin/admin-view";

export default function AdminPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{UI.admin.title}</h1>
        <p className="text-muted-foreground mt-1">Panel de administración global</p>
      </div>
      <AdminView />
    </div>
  );
}

