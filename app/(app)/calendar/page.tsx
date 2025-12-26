import { UI } from "@/lib/copy/uiStrings";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{UI.calendar.title}</h1>
          <p className="text-muted-foreground mt-1">Visualiza y gestiona citas agendadas</p>
        </div>
      </div>
      <CalendarView />
    </div>
  );
}

