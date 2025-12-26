"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Plus,
  Trash2,
  Settings2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface CalendarConnection {
  id: string;
  provider: "GOOGLE" | "OUTLOOK";
  externalEmail: string;
  calendarName?: string;
  isDefault: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  workingDays: number[];
  bufferMinutes: number;
  defaultDuration: number;
  syncEnabled: boolean;
  lastSyncAt?: string;
  isActive: boolean;
}

const DAYS = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
];

export function CalendarSettings() {
  const [connections, setConnections] = useState<CalendarConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<CalendarConnection | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch("/api/calendar/connections");
      if (response.ok) {
        const data = await response.json();
        setConnections(data.connections || []);
      }
    } catch (error) {
      console.error("Error fetching connections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (provider: "google" | "outlook") => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/calendar/connect?provider=${provider}`);
      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        toast.error("Error al conectar calendario");
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast.error("Error al conectar calendario");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    try {
      const response = await fetch(`/api/calendar/connections?id=${connectionId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setConnections(prev => prev.filter(c => c.id !== connectionId));
        toast.success("Calendario desconectado");
      }
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Error al desconectar");
    }
  };

  const handleUpdateSettings = async (connectionId: string, updates: Partial<CalendarConnection>) => {
    try {
      const response = await fetch(`/api/calendar/connections/${connectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        setConnections(prev =>
          prev.map(c => (c.id === connectionId ? { ...c, ...updates } : c))
        );
        toast.success("Configuración guardada");
      }
    } catch (error) {
      console.error("Error updating:", error);
    }
  };

  const toggleDay = (connection: CalendarConnection, day: number) => {
    const newDays = connection.workingDays.includes(day)
      ? connection.workingDays.filter(d => d !== day)
      : [...connection.workingDays, day].sort();
    handleUpdateSettings(connection.id, { workingDays: newDays });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">Calendario</h3>
        <p className="text-sm text-muted-foreground">
          Conecta tu calendario personal para que la IA pueda revisar tu disponibilidad y agendar citas automáticamente.
        </p>
      </div>

      {/* Connect buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Conectar calendario</CardTitle>
          <CardDescription>
            Vincula tu cuenta de Google o Microsoft para sincronizar tu calendario
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => handleConnect("google")}
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Conectar Google Calendar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleConnect("outlook")}
            disabled={isConnecting}
            className="flex items-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V12zm-6-8.25v3h3v-3zm0 4.5v3h3v-3zm0 4.5v1.83l3.05-1.83zm-5.25-9v3h3.75v-3zm0 4.5v3h3.75v-3zm0 4.5v2.03l2.41 1.5 1.34-.8v-2.73zM9 3.75V6h2l.13.01.12.04v-2.3zM5.98 15.98q.9 0 1.6-.3.7-.32 1.19-.86.48-.55.73-1.28.25-.74.25-1.61 0-.83-.25-1.55-.24-.71-.71-1.24t-1.15-.83q-.68-.3-1.55-.3-.92 0-1.64.3-.71.3-1.2.85-.5.54-.75 1.3-.25.74-.25 1.63 0 .85.26 1.56.26.72.74 1.23.48.52 1.17.81.69.3 1.56.3zM7.5 21h12.39L12 16.08V17q0 .41-.3.7-.29.3-.7.3H7.5zm15-.13v-7.24l-5.9 3.54Z"
              />
            </svg>
            Conectar Outlook
          </Button>
        </CardContent>
      </Card>

      {/* Connected calendars */}
      {connections.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Calendarios conectados</h4>
          
          {connections.map((connection) => (
            <Card key={connection.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {connection.calendarName || connection.externalEmail}
                        {connection.isDefault && (
                          <Badge variant="secondary" className="text-xs">Principal</Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        {connection.provider === "GOOGLE" ? "Google Calendar" : "Outlook"}
                        {connection.syncEnabled && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle2 className="h-3 w-3 ml-2 mr-1" />
                            Sincronizado
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDisconnect(connection.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Working hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Hora inicio</Label>
                    <Input
                      type="time"
                      value={connection.workingHoursStart}
                      onChange={(e) => handleUpdateSettings(connection.id, { workingHoursStart: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Hora fin</Label>
                    <Input
                      type="time"
                      value={connection.workingHoursEnd}
                      onChange={(e) => handleUpdateSettings(connection.id, { workingHoursEnd: e.target.value })}
                    />
                  </div>
                </div>

                {/* Working days */}
                <div className="space-y-2">
                  <Label className="text-sm">Días laborales</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.value}
                        onClick={() => toggleDay(connection, day.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          connection.workingDays.includes(day.value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Buffer and duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Duración predeterminada</Label>
                    <Select
                      value={String(connection.defaultDuration)}
                      onValueChange={(v) => handleUpdateSettings(connection.id, { defaultDuration: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">1 hora</SelectItem>
                        <SelectItem value="90">1.5 horas</SelectItem>
                        <SelectItem value="120">2 horas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Tiempo entre citas</Label>
                    <Select
                      value={String(connection.bufferMinutes)}
                      onValueChange={(v) => handleUpdateSettings(connection.id, { bufferMinutes: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin buffer</SelectItem>
                        <SelectItem value="5">5 minutos</SelectItem>
                        <SelectItem value="10">10 minutos</SelectItem>
                        <SelectItem value="15">15 minutos</SelectItem>
                        <SelectItem value="30">30 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Sync toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Sincronización automática</Label>
                    <p className="text-xs text-muted-foreground">
                      La IA revisará este calendario para agendar citas
                    </p>
                  </div>
                  <Switch
                    checked={connection.syncEnabled}
                    onCheckedChange={(checked) => handleUpdateSettings(connection.id, { syncEnabled: checked })}
                  />
                </div>

                {connection.lastSyncAt && (
                  <p className="text-xs text-muted-foreground">
                    Última sincronización: {new Date(connection.lastSyncAt).toLocaleString("es-MX")}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty state */}
      {connections.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="font-medium mb-1">Sin calendarios conectados</h4>
            <p className="text-sm text-muted-foreground max-w-sm">
              Conecta tu calendario para que la IA pueda revisar tu disponibilidad y agendar citas automáticamente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
