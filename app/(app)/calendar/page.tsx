import { UI } from "@/lib/copy/uiStrings";
import { CalendarView } from "@/components/calendar/calendar-view";

export default function CalendarPage() {
  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{UI.calendar.title}</h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1">Visualiza y gestiona citas agendadas</p>
        </div>
      </div>
      <CalendarView />
    </div>
  );
}

