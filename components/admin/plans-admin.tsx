"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Settings, Globe, DollarSign, Edit, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface Plan {
  id: string;
  code: string;
  name: string;
  description?: string;
  isPublic: boolean;
  isActive: boolean;
  regionCount: number;
}

interface PlanRegion {
  id: string;
  planId: string;
  regionCode: string;
  regionName: string;
  currency: string;
  displayPriceMonthly: number;
  stripePriceId?: string;
  includedCallMinutes: number;
  includedWhatsappConversations: number;
  includedSeats?: number;
  includedAgents?: number;
  overageCallMinutePrice: number;
  overageWhatsappConversationPrice: number;
  limitMode: "soft" | "hard";
  isActive: boolean;
}

interface Region {
  code: string;
  name: string;
  isActive: boolean;
}

const mockPlans: Plan[] = [
  { id: "1", code: "starter", name: "Inicial", isPublic: true, isActive: true, regionCount: 2 },
  { id: "2", code: "growth", name: "Crecimiento", isPublic: true, isActive: true, regionCount: 2 },
  { id: "3", code: "pro", name: "Profesional", isPublic: true, isActive: true, regionCount: 2 },
];

const mockRegions: Region[] = [
  { code: "NA", name: "Norteamérica", isActive: true },
  { code: "LATAM_NORTE", name: "LATAM Norte", isActive: true },
  { code: "LATAM_SUR", name: "LATAM Sur", isActive: true },
  { code: "EU", name: "Europa", isActive: true },
];

const mockPlanRegions: PlanRegion[] = [
  {
    id: "1",
    planId: "1",
    regionCode: "LATAM_NORTE",
    regionName: "LATAM Norte",
    currency: "MXN",
    displayPriceMonthly: 499,
    includedCallMinutes: 100,
    includedWhatsappConversations: 500,
    includedSeats: 2,
    includedAgents: 1,
    overageCallMinutePrice: 1.5,
    overageWhatsappConversationPrice: 0.5,
    limitMode: "soft",
    isActive: true,
  },
  {
    id: "2",
    planId: "2",
    regionCode: "LATAM_NORTE",
    regionName: "LATAM Norte",
    currency: "MXN",
    displayPriceMonthly: 1499,
    includedCallMinutes: 500,
    includedWhatsappConversations: 2000,
    includedSeats: 5,
    includedAgents: 3,
    overageCallMinutePrice: 1.2,
    overageWhatsappConversationPrice: 0.4,
    limitMode: "soft",
    isActive: true,
  },
];

export function PlansAdmin() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditRegionOpen, setIsEditRegionOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<PlanRegion | null>(null);

  const handleEditRegion = (region: PlanRegion) => {
    setEditingRegion(region);
    setIsEditRegionOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Plans List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.admin.plans.title}</CardTitle>
              <CardDescription>
                Administra los planes públicos y sus precios por región
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {UI.admin.plans.addPlan}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Regiones</TableHead>
                <TableHead>Público</TableHead>
                <TableHead>{UI.common.status}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPlans.map((plan) => (
                <TableRow
                  key={plan.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {plan.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.regionCount} regiones</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isPublic ? "default" : "secondary"}>
                      {plan.isPublic ? "Sí" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.isActive ? "default" : "secondary"}>
                      {plan.isActive ? UI.common.active : UI.common.inactive}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>{UI.common.edit}</DropdownMenuItem>
                        <DropdownMenuItem>Desactivar</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Plan Regions Detail */}
      {selectedPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {UI.admin.plans.pricing}: {selectedPlan.name}
                </CardTitle>
                <CardDescription>
                  Configura precios y cuotas por región
                </CardDescription>
              </div>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                {UI.admin.plans.addRegion}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Región</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Min. incluidos</TableHead>
                  <TableHead>Conv. incluidas</TableHead>
                  <TableHead>Excedente min.</TableHead>
                  <TableHead>Excedente conv.</TableHead>
                  <TableHead>Límite</TableHead>
                  <TableHead>{UI.common.status}</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockPlanRegions
                  .filter((pr) => pr.planId === selectedPlan.id)
                  .map((region) => (
                    <TableRow key={region.id}>
                      <TableCell className="font-medium">{region.regionName}</TableCell>
                      <TableCell>
                        ${region.displayPriceMonthly.toLocaleString()} {region.currency}
                      </TableCell>
                      <TableCell>{region.includedCallMinutes.toLocaleString()}</TableCell>
                      <TableCell>{region.includedWhatsappConversations.toLocaleString()}</TableCell>
                      <TableCell>${region.overageCallMinutePrice}</TableCell>
                      <TableCell>${region.overageWhatsappConversationPrice}</TableCell>
                      <TableCell>
                        <Badge variant={region.limitMode === "hard" ? "destructive" : "secondary"}>
                          {region.limitMode === "hard" ? "Estricto" : "Flexible"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={region.isActive ? "default" : "secondary"}>
                          {region.isActive ? UI.common.active : UI.common.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEditRegion(region)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Regions Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.admin.plans.regions}</CardTitle>
              <CardDescription>
                Administra las regiones disponibles y el mapeo de países
              </CardDescription>
            </div>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              {UI.admin.plans.addRegion}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {mockRegions.map((region) => (
              <div
                key={region.code}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{region.name}</p>
                  <code className="text-xs text-muted-foreground">{region.code}</code>
                </div>
                <Switch checked={region.isActive} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Region Dialog */}
      <Dialog open={isEditRegionOpen} onOpenChange={setIsEditRegionOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar precios de región</DialogTitle>
            <DialogDescription>
              {editingRegion?.regionName} - {selectedPlan?.name}
            </DialogDescription>
          </DialogHeader>

          {editingRegion && (
            <div className="space-y-6 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Precio mensual</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      defaultValue={editingRegion.displayPriceMonthly}
                    />
                    <Select defaultValue={editingRegion.currency}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">MXN</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="COP">COP</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>ID de precio (proveedor)</Label>
                  <Input
                    placeholder="price_..."
                    defaultValue={editingRegion.stripePriceId}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Cuotas incluidas</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Minutos de llamada</Label>
                    <Input
                      type="number"
                      defaultValue={editingRegion.includedCallMinutes}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conversaciones</Label>
                    <Input
                      type="number"
                      defaultValue={editingRegion.includedWhatsappConversations}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Usuarios</Label>
                    <Input
                      type="number"
                      defaultValue={editingRegion.includedSeats}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agentes</Label>
                    <Input
                      type="number"
                      defaultValue={editingRegion.includedAgents}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Precios de excedente</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Por minuto adicional</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={editingRegion.overageCallMinutePrice}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Por conversación adicional</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        defaultValue={editingRegion.overageWhatsappConversationPrice}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Modo de límite</p>
                  <p className="text-sm text-muted-foreground">
                    {editingRegion.limitMode === "hard"
                      ? "Bloquea el servicio al exceder cuotas"
                      : "Solo muestra advertencias al exceder"}
                  </p>
                </div>
                <Select defaultValue={editingRegion.limitMode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soft">Flexible</SelectItem>
                    <SelectItem value="hard">Estricto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">{UI.common.status}</p>
                  <p className="text-sm text-muted-foreground">
                    Disponible para nuevas suscripciones
                  </p>
                </div>
                <Switch defaultChecked={editingRegion.isActive} />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsEditRegionOpen(false)}>
                  {UI.common.cancel}
                </Button>
                <Button>{UI.common.save}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

