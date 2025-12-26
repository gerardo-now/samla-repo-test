"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, User, MapPin, Video, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendeeName?: string;
  attendeePhone?: string;
  location?: string;
  status: "confirmed" | "cancelled" | "tentative";
}

const mockEvents: CalendarEvent[] = [];

export function CalendarView() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const eventsForSelectedDate = mockEvents.filter((event) =>
    isSameDay(event.startTime, selectedDate)
  );

  const navigateWeek = (direction: "prev" | "next") => {
    setCurrentWeekStart((current) =>
      addDays(current, direction === "next" ? 7 : -7)
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Week View */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>{UI.calendar.upcoming}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateWeek("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-32 text-center">
                {format(currentWeekStart, "MMMM yyyy", { locale: es })}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigateWeek("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week Days */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDays.map((day) => {
              const hasEvents = mockEvents.some((e) => isSameDay(e.startTime, day));
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-lg transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isToday
                      ? "bg-primary/10"
                      : "hover:bg-muted"
                  )}
                >
                  <span className="text-xs uppercase">
                    {format(day, "EEE", { locale: es })}
                  </span>
                  <span className="text-lg font-semibold mt-1">
                    {format(day, "d")}
                  </span>
                  {hasEvents && !isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1" />
                  )}
                </button>
              );
            })}
          </div>

          <Separator className="my-4" />

          {/* Events for selected date */}
          <div className="space-y-4">
            <h4 className="font-medium">
              {format(selectedDate, "EEEE, d MMMM", { locale: es })}
            </h4>

            {eventsForSelectedDate.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay citas para este día</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eventsForSelectedDate.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                  >
                    <div className="w-1 h-full min-h-16 rounded-full bg-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-medium">{event.title}</h5>
                        <Badge
                          variant={
                            event.status === "confirmed"
                              ? "default"
                              : event.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {event.status === "confirmed"
                            ? UI.calendar.event.confirmed
                            : event.status === "cancelled"
                            ? UI.calendar.event.cancelled
                            : "Tentativo"}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3.5 w-3.5" />
                          <span>
                            {format(event.startTime, "HH:mm")} -{" "}
                            {format(event.endTime, "HH:mm")}
                          </span>
                        </div>
                        {event.attendeeName && (
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5" />
                            <span>{event.attendeeName}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions & Stats */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Agendar cita manual
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Video className="h-4 w-4 mr-2" />
              Crear enlace de reunión
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Esta semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Citas</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">0</p>
                <p className="text-sm text-muted-foreground">Horas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

