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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Building2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface Customer {
  id: string;
  name: string;
  slug: string;
  planCode: string;
  regionCode: string;
  status: "active" | "past_due" | "cancelled" | "trialing";
  mrr: number;
  currency: string;
  memberCount: number;
  createdAt: Date;
  currentPeriodEnd?: Date;
  usage: {
    callMinutesUsed: number;
    callMinutesIncluded: number;
    whatsappConversationsUsed: number;
    whatsappConversationsIncluded: number;
  };
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    name: "Empresa Demo",
    slug: "empresa-demo",
    planCode: "growth",
    regionCode: "LATAM_NORTE",
    status: "active",
    mrr: 1499,
    currency: "MXN",
    memberCount: 3,
    createdAt: new Date("2024-06-15"),
    currentPeriodEnd: new Date("2025-01-15"),
    usage: {
      callMinutesUsed: 342,
      callMinutesIncluded: 500,
      whatsappConversationsUsed: 1850,
      whatsappConversationsIncluded: 2000,
    },
  },
  {
    id: "2",
    name: "Startup XYZ",
    slug: "startup-xyz",
    planCode: "starter",
    regionCode: "LATAM_NORTE",
    status: "active",
    mrr: 499,
    currency: "MXN",
    memberCount: 2,
    createdAt: new Date("2024-09-01"),
    currentPeriodEnd: new Date("2025-01-01"),
    usage: {
      callMinutesUsed: 95,
      callMinutesIncluded: 100,
      whatsappConversationsUsed: 520,
      whatsappConversationsIncluded: 500,
    },
  },
];

const statusConfig = {
  active: { label: "Activo", variant: "default" as const },
  past_due: { label: "Pago pendiente", variant: "destructive" as const },
  cancelled: { label: "Cancelado", variant: "secondary" as const },
  trialing: { label: "Prueba", variant: "outline" as const },
};

export function CustomersAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = mockCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.admin.customers.title}</CardTitle>
              <CardDescription>
                Visualiza todos los clientes y su estado de suscripción
              </CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Región</TableHead>
                <TableHead>{UI.common.status}</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Miembros</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.planCode}</Badge>
                  </TableCell>
                  <TableCell>{customer.regionCode}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[customer.status].variant}>
                      {statusConfig[customer.status].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    ${customer.mrr.toLocaleString()} {customer.currency}
                  </TableCell>
                  <TableCell>{customer.memberCount}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {customer.createdAt.toLocaleDateString("es-MX")}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Customer Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedCustomer?.name}</DialogTitle>
            <DialogDescription>
              {UI.admin.customers.details}
            </DialogDescription>
          </DialogHeader>

          {selectedCustomer && (
            <div className="space-y-6 py-4">
              {/* Info */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <Badge variant="secondary" className="text-sm">
                    {selectedCustomer.planCode}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Región</p>
                  <p className="font-medium">{selectedCustomer.regionCode}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Renovación</p>
                  <p className="font-medium">
                    {selectedCustomer.currentPeriodEnd?.toLocaleDateString("es-MX")}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Usage */}
              <div className="space-y-4">
                <h4 className="font-medium">{UI.admin.customers.usageHistory}</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Minutos de llamada</span>
                      <span>
                        {selectedCustomer.usage.callMinutesUsed.toLocaleString()} /{" "}
                        {selectedCustomer.usage.callMinutesIncluded.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedCustomer.usage.callMinutesUsed /
                          selectedCustomer.usage.callMinutesIncluded) *
                        100
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Conversaciones</span>
                      <span>
                        {selectedCustomer.usage.whatsappConversationsUsed.toLocaleString()} /{" "}
                        {selectedCustomer.usage.whatsappConversationsIncluded.toLocaleString()}
                      </span>
                    </div>
                    <Progress
                      value={
                        (selectedCustomer.usage.whatsappConversationsUsed /
                          selectedCustomer.usage.whatsappConversationsIncluded) *
                        100
                      }
                      className={
                        selectedCustomer.usage.whatsappConversationsUsed >
                        selectedCustomer.usage.whatsappConversationsIncluded
                          ? "[&>div]:bg-destructive"
                          : ""
                      }
                    />
                    {selectedCustomer.usage.whatsappConversationsUsed >
                      selectedCustomer.usage.whatsappConversationsIncluded && (
                      <p className="text-xs text-destructive">
                        Excedente:{" "}
                        {(
                          selectedCustomer.usage.whatsappConversationsUsed -
                          selectedCustomer.usage.whatsappConversationsIncluded
                        ).toLocaleString()}{" "}
                        conversaciones
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Actions */}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  Ver excepciones
                </Button>
                <Button variant="outline" className="flex-1">
                  Ver auditoría
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

