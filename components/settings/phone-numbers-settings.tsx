"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Phone, Plus, Bot, Trash2, Settings, Loader2, Link2, Link2Off } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PhoneNumber {
  id: string;
  phoneNumber: string;
  friendlyName: string;
  country: string;
  agentId: string | null;
  agentName?: string;
  isActive: boolean;
}

interface Agent {
  id: string;
  name: string;
  template: string;
  isActive: boolean;
}

export function PhoneNumbersSettings() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [numberToDelete, setNumberToDelete] = useState<string | null>(null);
  
  // Add number form
  const [newNumber, setNewNumber] = useState("");
  const [newFriendlyName, setNewFriendlyName] = useState("");
  const [newCountry, setNewCountry] = useState("MX");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Assign agent form
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");

  useEffect(() => {
    fetchPhoneNumbers();
    fetchAgents();
  }, []);

  const fetchPhoneNumbers = async () => {
    try {
      const response = await fetch("/api/phone-numbers");
      const data = await response.json();
      if (data.success) {
        setPhoneNumbers(data.phoneNumbers);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
      toast.error("Error al cargar números");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const data = await response.json();
      if (data.success) {
        setAgents(data.agents.filter((a: Agent) => a.isActive));
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const handleAddNumber = async () => {
    if (!newNumber.trim()) {
      toast.error("Ingresa un número de teléfono");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: newNumber,
          friendlyName: newFriendlyName || newNumber,
          country: newCountry,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Número agregado");
        setPhoneNumbers([...phoneNumbers, data.phoneNumber]);
        setIsAddDialogOpen(false);
        setNewNumber("");
        setNewFriendlyName("");
      } else {
        toast.error(data.error || "Error al agregar número");
      }
    } catch (error) {
      console.error("Error adding number:", error);
      toast.error("Error al agregar número");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedNumber) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/phone-numbers/${selectedNumber.id}/assign-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success(selectedAgentId ? "Agente asignado" : "Agente desvinculado");
        
        // Update local state
        setPhoneNumbers(phoneNumbers.map(pn => 
          pn.id === selectedNumber.id 
            ? { 
                ...pn, 
                agentId: selectedAgentId || null,
                agentName: agents.find(a => a.id === selectedAgentId)?.name,
              }
            : pn
        ));
        
        setIsAssignDialogOpen(false);
        setSelectedNumber(null);
        setSelectedAgentId("");
      } else {
        toast.error(data.error || "Error al asignar agente");
      }
    } catch (error) {
      console.error("Error assigning agent:", error);
      toast.error("Error al asignar agente");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNumber = async () => {
    if (!numberToDelete) return;

    try {
      const response = await fetch(`/api/phone-numbers?id=${numberToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Número eliminado");
        setPhoneNumbers(phoneNumbers.filter(pn => pn.id !== numberToDelete));
      } else {
        toast.error(data.error || "Error al eliminar número");
      }
    } catch (error) {
      console.error("Error deleting number:", error);
      toast.error("Error al eliminar número");
    } finally {
      setIsDeleteDialogOpen(false);
      setNumberToDelete(null);
    }
  };

  const openAssignDialog = (phoneNumber: PhoneNumber) => {
    setSelectedNumber(phoneNumber);
    setSelectedAgentId(phoneNumber.agentId || "");
    setIsAssignDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Números de Teléfono
              </CardTitle>
              <CardDescription className="mt-1">
                Configura tus números para llamadas entrantes y salientes
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Número
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {phoneNumbers.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No hay números configurados</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Agrega un número para recibir y hacer llamadas con agentes de IA
              </p>
              <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar Número
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Agente Asignado</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {phoneNumbers.map((pn) => (
                  <TableRow key={pn.id}>
                    <TableCell className="font-mono">{pn.phoneNumber}</TableCell>
                    <TableCell>{pn.friendlyName}</TableCell>
                    <TableCell>
                      {pn.agentId ? (
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <span>{pn.agentName || "Agente"}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Sin asignar</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={pn.isActive ? "default" : "secondary"}>
                        {pn.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openAssignDialog(pn)}
                          title="Asignar agente"
                        >
                          {pn.agentId ? (
                            <Link2 className="h-4 w-4 text-primary" />
                          ) : (
                            <Link2Off className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setNumberToDelete(pn.id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
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

      {/* Add Number Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Número de Teléfono</DialogTitle>
            <DialogDescription>
              Ingresa el número que usarás para llamadas con tus agentes de IA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Número de teléfono *</Label>
              <Input
                placeholder="+52 55 1234 5678"
                value={newNumber}
                onChange={(e) => setNewNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Incluye el código de país (ej: +52 para México)
              </p>
            </div>

            <div className="space-y-2">
              <Label>Nombre descriptivo</Label>
              <Input
                placeholder="Ej: Línea de ventas"
                value={newFriendlyName}
                onChange={(e) => setNewFriendlyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>País</Label>
              <Select value={newCountry} onValueChange={setNewCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MX">México</SelectItem>
                  <SelectItem value="US">Estados Unidos</SelectItem>
                  <SelectItem value="CO">Colombia</SelectItem>
                  <SelectItem value="AR">Argentina</SelectItem>
                  <SelectItem value="ES">España</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddNumber} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Agent Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Agente al Número</DialogTitle>
            <DialogDescription>
              Cuando llegue una llamada a este número, será atendida por el agente seleccionado
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-muted/50 rounded-lg mb-4">
              <p className="text-sm font-medium">{selectedNumber?.friendlyName}</p>
              <p className="text-sm font-mono text-muted-foreground">
                {selectedNumber?.phoneNumber}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Agente de IA</Label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <span className="text-muted-foreground">Sin agente (no contestar)</span>
                  </SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4" />
                        <span>{agent.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {agent.template.toLowerCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                El agente usará su voz y configuración para responder llamadas
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignAgent} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedAgentId ? "Asignar Agente" : "Desvincular Agente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar número?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El número dejará de recibir llamadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteNumber}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

