import { UI } from "@/lib/copy/uiStrings";
import { SettingsView } from "@/components/settings/settings-view";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{UI.settings.title}</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1">Configura tu espacio de trabajo</p>
      </div>
      <SettingsView />
    </div>
  );
}

