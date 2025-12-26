"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Edit, Trash2 } from "lucide-react";

interface WorkspaceOverride {
  id: string;
  workspaceId: string;
  workspaceName: string;
  customIncludedCallMinutes?: number;
  customIncludedWhatsappConversations?: number;
  customOverageCallMinutePrice?: number;
  customOverageWhatsappConversationPrice?: number;
  customLimitMode?: "soft" | "hard";
  notes?: string;
  isActive: boolean;
  createdAt: Date;
}

const mockOverrides: WorkspaceOverride[] = [
  {
    id: "1",
    workspaceId: "ws-1",
    workspaceName: "Cliente Premium",
    customIncludedCallMinutes: 1000,
    customIncludedWhatsappConversations: 5000,
    customLimitMode: "soft",
    notes: "Cliente enterprise con acuerdo especial",
    isActive: true,
    createdAt: new Date("2024-10-01"),
  },
];

export function OverridesAdmin() {
  const [isAddOverrideOpen, setIsAddOverrideOpen] = useState(false);
  const [editingOverride, setEditingOverride] = useState<WorkspaceOverride | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.admin.overrides.title}</CardTitle>
              <CardDescription>
                Aplica cuotas o precios personalizados a clientes específicos
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddOverrideOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.admin.overrides.add}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {mockOverrides.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No hay excepciones configuradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Min. personalizados</TableHead>
                  <TableHead>Conv. personalizadas</TableHead>
                  <TableHead>Modo límite</TableHead>
                  <TableHead>Notas</TableHead>
                  <TableHead>{UI.common.status}</TableHead>
                  <TableHead className="w-24"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOverrides.map((override) => (
                  <TableRow key={override.id}>
                    <TableCell className="font-medium">
                      {override.workspaceName}
                    </TableCell>
                    <TableCell>
                      {override.customIncludedCallMinutes?.toLocaleString() || "—"}
                    </TableCell>
                    <TableCell>
                      {override.customIncludedWhatsappConversations?.toLocaleString() || "—"}
                    </TableCell>
                    <TableCell>
                      {override.customLimitMode ? (
                        <Badge variant={override.customLimitMode === "hard" ? "destructive" : "secondary"}>
                          {override.customLimitMode === "hard" ? "Estricto" : "Flexible"}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="max-w-48 truncate text-muted-foreground">
                      {override.notes || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={override.isActive ? "default" : "secondary"}>
                        {override.isActive ? UI.common.active : UI.common.inactive}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingOverride(override)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Override Dialog */}
      <Dialog
        open={isAddOverrideOpen || !!editingOverride}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOverrideOpen(false);
            setEditingOverride(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOverride ? "Editar excepción" : UI.admin.overrides.add}
            </DialogTitle>
            <DialogDescription>
              Configura cuotas o precios personalizados para este cliente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {!editingOverride && (
              <div className="space-y-2">
                <Label>Cliente</Label>
                <Input placeholder="Buscar cliente..." />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Minutos incluidos personalizados</Label>
                <Input
                  type="number"
                  placeholder="Usar valor del plan"
                  defaultValue={editingOverride?.customIncludedCallMinutes}
                />
              </div>
              <div className="space-y-2">
                <Label>Conversaciones incluidas personalizadas</Label>
                <Input
                  type="number"
                  placeholder="Usar valor del plan"
                  defaultValue={editingOverride?.customIncludedWhatsappConversations}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Precio excedente por minuto</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Usar valor del plan"
                    defaultValue={editingOverride?.customOverageCallMinutePrice}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Precio excedente por conversación</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Usar valor del plan"
                    defaultValue={editingOverride?.customOverageWhatsappConversationPrice}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notas internas</Label>
              <Textarea
                placeholder="Razón de la excepción, acuerdos especiales, etc."
                defaultValue={editingOverride?.notes}
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{UI.common.status}</p>
                <p className="text-sm text-muted-foreground">
                  Excepción activa y aplicada
                </p>
              </div>
              <Switch defaultChecked={editingOverride?.isActive ?? true} />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOverrideOpen(false);
                  setEditingOverride(null);
                }}
              >
                {UI.common.cancel}
              </Button>
              <Button>{UI.common.save}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

