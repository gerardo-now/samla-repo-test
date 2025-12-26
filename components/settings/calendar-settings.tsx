"use client";

import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Link2, Unlink, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarConnection {
  id: string;
  provider: "google" | "outlook";
  email: string;
  isDefault: boolean;
}

const mockConnections: CalendarConnection[] = [];

const providerConfig = {
  google: { name: "Calendario", color: "text-red-600 bg-red-500/10" },
  outlook: { name: "Calendario", color: "text-blue-600 bg-blue-500/10" },
};

const weekDays = [
  { value: 1, label: UI.calendar.days.monday },
  { value: 2, label: UI.calendar.days.tuesday },
  { value: 3, label: UI.calendar.days.wednesday },
  { value: 4, label: UI.calendar.days.thursday },
  { value: 5, label: UI.calendar.days.friday },
  { value: 6, label: UI.calendar.days.saturday },
  { value: 0, label: UI.calendar.days.sunday },
];

export function CalendarSettings() {
  return (
    <div className="space-y-6">
      {/* Connected Calendars */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calendarios conectados</CardTitle>
              <CardDescription>
                Conecta tu calendario para que los agentes puedan agendar citas
              </CardDescription>
            </div>
            <Button>
              <Link2 className="h-4 w-4 mr-2" />
              {UI.calendar.connect}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mockConnections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay calendarios conectados</p>
              <p className="text-sm mt-1">
                Conecta tu calendario para habilitar el agendamiento automático
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        providerConfig[connection.provider].color
                      )}
                    >
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {providerConfig[connection.provider].name}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {connection.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {connection.isDefault && (
                      <Badge variant="default">{UI.settings.callerId.default}</Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Unlink className="h-4 w-4 mr-2" />
                      {UI.calendar.disconnect}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card>
        <CardHeader>
          <CardTitle>{UI.calendar.settings.workingHours}</CardTitle>
          <CardDescription>
            Define cuándo pueden agendarse citas automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Hora de inicio</Label>
              <Input type="time" defaultValue="09:00" />
            </div>
            <div className="space-y-2">
              <Label>Hora de fin</Label>
              <Input type="time" defaultValue="18:00" />
            </div>
          </div>

          <div className="space-y-3">
            <Label>{UI.calendar.settings.workingDays}</Label>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <div
                  key={day.value}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox id={`day-${day.value}`} defaultChecked={day.value >= 1 && day.value <= 5} />
                  <Label htmlFor={`day-${day.value}`} className="cursor-pointer text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{UI.calendar.settings.buffer}</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="15" min="0" max="60" className="w-20" />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{UI.calendar.settings.duration}</Label>
              <div className="flex items-center gap-2">
                <Input type="number" defaultValue="30" min="15" max="120" className="w-20" />
                <span className="text-sm text-muted-foreground">minutos</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button>{UI.common.save}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

