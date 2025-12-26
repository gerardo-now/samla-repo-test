"use client";

import { UI } from "@/lib/copy/uiStrings";
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
import { TrendingUp, DollarSign, Users, Phone, MessageSquare } from "lucide-react";
import { useState } from "react";

interface RegionUsage {
  regionCode: string;
  regionName: string;
  totalMinutes: number;
  totalConversations: number;
  estimatedCogs: number;
  estimatedRevenue: number;
  estimatedMargin: number;
  workspaceCount: number;
}

interface WorkspaceUsage {
  id: string;
  name: string;
  planCode: string;
  regionCode: string;
  callMinutesUsed: number;
  whatsappConversationsUsed: number;
  currentSpend: number;
  overageAmount: number;
  alerts: string[];
}

const mockRegionUsage: RegionUsage[] = [
  {
    regionCode: "LATAM_NORTE",
    regionName: "LATAM Norte",
    totalMinutes: 15420,
    totalConversations: 48230,
    estimatedCogs: 12340,
    estimatedRevenue: 45600,
    estimatedMargin: 72.9,
    workspaceCount: 45,
  },
  {
    regionCode: "NA",
    regionName: "Norteamérica",
    totalMinutes: 8750,
    totalConversations: 22100,
    estimatedCogs: 8200,
    estimatedRevenue: 28400,
    estimatedMargin: 71.1,
    workspaceCount: 18,
  },
];

const mockWorkspaceUsage: WorkspaceUsage[] = [
  {
    id: "1",
    name: "Empresa Demo",
    planCode: "growth",
    regionCode: "LATAM_NORTE",
    callMinutesUsed: 342,
    whatsappConversationsUsed: 1850,
    currentSpend: 1499,
    overageAmount: 0,
    alerts: [],
  },
  {
    id: "2",
    name: "Startup XYZ",
    planCode: "starter",
    regionCode: "LATAM_NORTE",
    callMinutesUsed: 95,
    whatsappConversationsUsed: 520,
    currentSpend: 499,
    overageAmount: 10,
    alerts: ["Cuota de conversaciones excedida"],
  },
];

export function UsageAdmin() {
  const [viewMode, setViewMode] = useState<"region" | "workspace">("region");

  const totalMrr = mockWorkspaceUsage.reduce((sum, w) => sum + w.currentSpend, 0);
  const totalWorkspaces = mockWorkspaceUsage.length;
  const totalMinutes = mockRegionUsage.reduce((sum, r) => sum + r.totalMinutes, 0);
  const totalConversations = mockRegionUsage.reduce((sum, r) => sum + r.totalConversations, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {UI.admin.usage.metrics.mrr}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalMrr.toLocaleString()} MXN
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12.5% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {UI.admin.usage.metrics.activeSubscriptions}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkspaces}</div>
            <p className="text-xs text-muted-foreground mt-1">
              clientes activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {UI.admin.usage.metrics.totalMinutes}
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMinutes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              minutos este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {UI.admin.usage.metrics.totalConversations}
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              conversaciones este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Usage Tables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.admin.usage.title}</CardTitle>
              <CardDescription>
                Visualiza uso y márgenes por región o cliente
              </CardDescription>
            </div>
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as "region" | "workspace")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="region">{UI.admin.usage.byRegion}</SelectItem>
                <SelectItem value="workspace">{UI.admin.usage.byWorkspace}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === "region" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Región</TableHead>
                  <TableHead>Clientes</TableHead>
                  <TableHead>Minutos</TableHead>
                  <TableHead>Conversaciones</TableHead>
                  <TableHead>{UI.admin.usage.metrics.estimatedCogs}</TableHead>
                  <TableHead>Ingresos</TableHead>
                  <TableHead>{UI.admin.usage.metrics.estimatedMargin}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRegionUsage.map((region) => (
                  <TableRow key={region.regionCode}>
                    <TableCell className="font-medium">{region.regionName}</TableCell>
                    <TableCell>{region.workspaceCount}</TableCell>
                    <TableCell>{region.totalMinutes.toLocaleString()}</TableCell>
                    <TableCell>{region.totalConversations.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">
                      ${region.estimatedCogs.toLocaleString()}
                    </TableCell>
                    <TableCell>${region.estimatedRevenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={region.estimatedMargin > 70 ? "default" : "secondary"}
                      >
                        {region.estimatedMargin.toFixed(1)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Región</TableHead>
                  <TableHead>Minutos</TableHead>
                  <TableHead>Conversaciones</TableHead>
                  <TableHead>Gasto actual</TableHead>
                  <TableHead>Excedente</TableHead>
                  <TableHead>Alertas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockWorkspaceUsage.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-medium">{workspace.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{workspace.planCode}</Badge>
                    </TableCell>
                    <TableCell>{workspace.regionCode}</TableCell>
                    <TableCell>{workspace.callMinutesUsed.toLocaleString()}</TableCell>
                    <TableCell>{workspace.whatsappConversationsUsed.toLocaleString()}</TableCell>
                    <TableCell>${workspace.currentSpend.toLocaleString()}</TableCell>
                    <TableCell>
                      {workspace.overageAmount > 0 ? (
                        <span className="text-orange-600">
                          +${workspace.overageAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">$0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {workspace.alerts.length > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {workspace.alerts.length} alerta(s)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

