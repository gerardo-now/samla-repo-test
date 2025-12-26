"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: Record<string, unknown>;
  createdAt: Date;
}

const mockAuditLogs: AuditLogEntry[] = [
  {
    id: "1",
    userId: "user-1",
    userName: "Admin Demo",
    action: "plan_region.update",
    resource: "PlanRegion",
    resourceId: "pr-1",
    changes: {
      displayPriceMonthly: { from: 499, to: 549 },
      includedCallMinutes: { from: 100, to: 150 },
    },
    createdAt: new Date("2024-12-20T14:30:00"),
  },
  {
    id: "2",
    userId: "user-1",
    userName: "Admin Demo",
    action: "workspace_override.create",
    resource: "WorkspaceOverride",
    resourceId: "wo-1",
    changes: {
      workspaceName: "Cliente Premium",
      customIncludedCallMinutes: 1000,
    },
    createdAt: new Date("2024-12-19T10:15:00"),
  },
  {
    id: "3",
    userId: "user-1",
    userName: "Admin Demo",
    action: "region.create",
    resource: "Region",
    resourceId: "r-1",
    changes: {
      code: "LATAM_SUR",
      name: "LATAM Sur",
    },
    createdAt: new Date("2024-12-18T09:00:00"),
  },
];

const actionLabels: Record<string, string> = {
  "plan_region.update": "Actualizar precio de región",
  "plan_region.create": "Crear precio de región",
  "workspace_override.create": "Crear excepción",
  "workspace_override.update": "Actualizar excepción",
  "workspace_override.delete": "Eliminar excepción",
  "region.create": "Crear región",
  "region.update": "Actualizar región",
  "plan.create": "Crear plan",
  "plan.update": "Actualizar plan",
};

export function AuditAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = mockAuditLogs.filter((log) => {
    if (actionFilter !== "all" && !log.action.includes(actionFilter)) return false;
    if (
      searchQuery &&
      !log.userName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !log.action.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.admin.audit.title}</CardTitle>
              <CardDescription>
                Historial de cambios realizados en la configuración de planes y precios
              </CardDescription>
            </div>
            <div className="flex gap-4">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por acción" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{UI.common.all}</SelectItem>
                  <SelectItem value="plan_region">Precios de región</SelectItem>
                  <SelectItem value="workspace_override">Excepciones</SelectItem>
                  <SelectItem value="region">Regiones</SelectItem>
                  <SelectItem value="plan">Planes</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={UI.common.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{UI.admin.audit.timestamp}</TableHead>
                <TableHead>{UI.admin.audit.user}</TableHead>
                <TableHead>{UI.admin.audit.action}</TableHead>
                <TableHead>Recurso</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-muted-foreground">
                    {log.createdAt.toLocaleString("es-MX")}
                  </TableCell>
                  <TableCell className="font-medium">{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {log.resource}
                    {log.resourceId && (
                      <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">
                        {log.resourceId}
                      </code>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {UI.admin.audit.changes}
            </DialogTitle>
            <DialogDescription>
              {selectedLog?.createdAt.toLocaleString("es-MX")} • {selectedLog?.userName}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{UI.admin.audit.action}</p>
                <Badge variant="secondary">
                  {actionLabels[selectedLog.action] || selectedLog.action}
                </Badge>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Recurso</p>
                <p className="font-mono text-sm">
                  {selectedLog.resource}
                  {selectedLog.resourceId && ` (${selectedLog.resourceId})`}
                </p>
              </div>

              {selectedLog.changes && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{UI.admin.audit.changes}</p>
                  <ScrollArea className="h-48 rounded-lg border bg-muted/50 p-4">
                    <pre className="text-sm font-mono whitespace-pre-wrap">
                      {JSON.stringify(selectedLog.changes, null, 2)}
                    </pre>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

