"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MessageSquare,
  Phone,
  Link2,
  Unlink,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Smartphone,
  RefreshCw,
  Bot,
  Plus,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";

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

interface WhatsAppChannel {
  id: string;
  phoneNumber: string;
  displayName: string;
  isConnected: boolean;
}

// Mock workspace ID - in production this comes from context/auth
const WORKSPACE_ID = "demo-workspace";
const WORKSPACE_NAME = "Mi Empresa";

export function ChannelsSettings() {
  // WhatsApp state
  const [whatsappChannels, setWhatsappChannels] = useState<WhatsAppChannel[]>([]);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] = useState(false);
  const [isCheckingWhatsApp, setIsCheckingWhatsApp] = useState(false);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);

  // Phone state
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingPhones, setIsLoadingPhones] = useState(true);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showAssignAgentDialog, setShowAssignAgentDialog] = useState(false);
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<PhoneNumber | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [phoneToDelete, setPhoneToDelete] = useState<string | null>(null);

  // New phone form
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newFriendlyName, setNewFriendlyName] = useState("");
  const [newCountry, setNewCountry] = useState("MX");

  const whatsappConnected = whatsappChannels.length > 0;
  const phoneConnected = phoneNumbers.length > 0;

  useEffect(() => {
    checkWhatsAppStatus();
    fetchPhoneNumbers();
    fetchAgents();
  }, []);

  // ============================================
  // WHATSAPP FUNCTIONS
  // ============================================

  const checkWhatsAppStatus = async () => {
    setIsCheckingWhatsApp(true);
    try {
      const response = await fetch(
        `/api/channels/whatsapp/connect?workspaceId=${WORKSPACE_ID}`
      );
      const data = await response.json();

      if (data.connected && data.phoneNumbers?.length > 0) {
        setWhatsappChannels(data.phoneNumbers.map((pn: any) => ({
          id: pn.id,
          phoneNumber: pn.phoneNumber,
          displayName: pn.displayName || "WhatsApp Business",
          isConnected: true,
        })));
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
    } finally {
      setIsCheckingWhatsApp(false);
    }
  };

  const handleConnectWhatsApp = async () => {
    setShowWhatsAppDialog(true);
    setSetupUrl(null);
    setIsConnectingWhatsApp(true);

    try {
      const response = await fetch("/api/channels/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceId: WORKSPACE_ID,
          workspaceName: WORKSPACE_NAME,
        }),
      });

      const data = await response.json();

      if (data.success && data.setupUrl) {
        setSetupUrl(data.setupUrl);
      } else {
        toast.error(data.error || "Error al generar enlace de configuración");
        setShowWhatsAppDialog(false);
      }
    } catch (error) {
      console.error("Error connecting WhatsApp:", error);
      toast.error("Error al conectar WhatsApp");
      setShowWhatsAppDialog(false);
    } finally {
      setIsConnectingWhatsApp(false);
    }
  };

  const openSetupLink = () => {
    if (setupUrl) {
      window.open(setupUrl, "_blank", "noopener,noreferrer");
      toast.info("Completa la configuración en la nueva ventana");
    }
  };

  const handleVerifyWhatsAppConnection = async () => {
    setIsCheckingWhatsApp(true);
    await checkWhatsAppStatus();
    
    if (whatsappChannels.length > 0) {
      toast.success("¡WhatsApp conectado exitosamente!");
      setShowWhatsAppDialog(false);
    } else {
      toast.info("Aún no detectamos la conexión. Completa el proceso en la otra ventana.");
    }
    setIsCheckingWhatsApp(false);
  };

  const handleDisconnectWhatsApp = (channelId: string) => {
    setWhatsappChannels(prev => prev.filter(c => c.id !== channelId));
    toast.success("WhatsApp desconectado");
  };

  // ============================================
  // PHONE NUMBER FUNCTIONS
  // ============================================

  const fetchPhoneNumbers = async () => {
    setIsLoadingPhones(true);
    try {
      const response = await fetch("/api/phone-numbers");
      const data = await response.json();
      if (data.success) {
        setPhoneNumbers(data.phoneNumbers);
      }
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
    } finally {
      setIsLoadingPhones(false);
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

  const handleAddPhoneNumber = async () => {
    if (!newPhoneNumber.trim()) {
      toast.error("Ingresa un número de teléfono");
      return;
    }

    // Format phone number
    let formattedNumber = newPhoneNumber.trim();
    if (!formattedNumber.startsWith("+")) {
      const countryCode = newCountry === "MX" ? "+52" : newCountry === "US" ? "+1" : "+52";
      formattedNumber = countryCode + formattedNumber.replace(/\D/g, "");
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/phone-numbers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: formattedNumber,
          friendlyName: newFriendlyName || `Línea ${phoneNumbers.length + 1}`,
          country: newCountry,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Número agregado exitosamente");
        setPhoneNumbers([...phoneNumbers, data.phoneNumber]);
        setShowPhoneDialog(false);
        setNewPhoneNumber("");
        setNewFriendlyName("");
      } else {
        toast.error(data.error || "Error al agregar número");
      }
    } catch (error) {
      console.error("Error adding phone number:", error);
      toast.error("Error al agregar número");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAssignAgentDialog = (phone: PhoneNumber) => {
    setSelectedPhoneNumber(phone);
    setSelectedAgentId(phone.agentId || "");
    setShowAssignAgentDialog(true);
  };

  const handleAssignAgent = async () => {
    if (!selectedPhoneNumber) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/phone-numbers/${selectedPhoneNumber.id}/assign-agent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgentId || null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        const agentName = agents.find(a => a.id === selectedAgentId)?.name;
        toast.success(selectedAgentId 
          ? `Agente "${agentName}" asignado al número` 
          : "Agente desvinculado del número"
        );
        
        // Update local state
        setPhoneNumbers(phoneNumbers.map(pn => 
          pn.id === selectedPhoneNumber.id 
            ? { ...pn, agentId: selectedAgentId || null, agentName }
            : pn
        ));
        
        setShowAssignAgentDialog(false);
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

  const handleDeletePhoneNumber = async () => {
    if (!phoneToDelete) return;

    try {
      const response = await fetch(`/api/phone-numbers?id=${phoneToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Número eliminado");
        setPhoneNumbers(phoneNumbers.filter(pn => pn.id !== phoneToDelete));
      } else {
        toast.error(data.error || "Error al eliminar número");
      }
    } catch (error) {
      console.error("Error deleting phone number:", error);
      toast.error("Error al eliminar número");
    } finally {
      setShowDeleteDialog(false);
      setPhoneToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <CardTitle>WhatsApp Business</CardTitle>
                <CardDescription>
                  Recibe y envía mensajes desde tu número de WhatsApp Business
                </CardDescription>
              </div>
            </div>
            {!whatsappConnected && (
              <Button
                variant="ghost"
                size="icon"
                onClick={checkWhatsAppStatus}
                disabled={isCheckingWhatsApp}
              >
                <RefreshCw className={`h-4 w-4 ${isCheckingWhatsApp ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {whatsappConnected ? (
            <div className="space-y-3">
              {whatsappChannels.map(channel => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{channel.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {channel.displayName} · Conectado
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnectWhatsApp(channel.id)}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Smartphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Conecta tu WhatsApp Business</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Vincula tu cuenta de WhatsApp Business para recibir mensajes de clientes
                directamente en tu bandeja de entrada
              </p>
              <Button onClick={handleConnectWhatsApp}>
                <Link2 className="h-4 w-4 mr-2" />
                Conectar WhatsApp
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Phone className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle>Llamadas telefónicas</CardTitle>
                <CardDescription>
                  Recibe y realiza llamadas con agentes de IA
                </CardDescription>
              </div>
            </div>
            {phoneConnected && (
              <Button onClick={() => setShowPhoneDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar número
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingPhones ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : phoneConnected ? (
            <div className="space-y-3">
              {phoneNumbers.map(phone => (
                <div
                  key={phone.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-mono">{phone.phoneNumber}</p>
                        <Badge variant={phone.isActive ? "default" : "secondary"} className="text-xs">
                          {phone.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {phone.friendlyName}
                        {phone.agentId && phone.agentName && (
                          <span className="ml-2">
                            · <Bot className="h-3 w-3 inline" /> {phone.agentName}
                          </span>
                        )}
                        {!phone.agentId && (
                          <span className="ml-2 text-amber-600">· Sin agente asignado</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAssignAgentDialog(phone)}
                    >
                      <Settings2 className="h-4 w-4 mr-2" />
                      {phone.agentId ? "Cambiar agente" : "Asignar agente"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPhoneToDelete(phone.id);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Unlink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Helpful tip */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-dashed">
                <p className="text-sm text-muted-foreground">
                  <strong>Importante:</strong> Asigna un agente a cada número para que las llamadas 
                  entrantes sean atendidas automáticamente por IA.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Activa las llamadas telefónicas</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Agrega un número telefónico para que tus agentes de IA puedan
                recibir y realizar llamadas
              </p>
              <Button onClick={() => setShowPhoneDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar número de teléfono
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Connection Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp Business</DialogTitle>
            <DialogDescription>
              Vincula tu cuenta de WhatsApp Business para empezar a recibir mensajes
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {isConnectingWhatsApp ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generando enlace de configuración...</p>
              </div>
            ) : setupUrl ? (
              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-muted space-y-3">
                  <h4 className="font-medium">Instrucciones:</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Haz clic en el botón de abajo para abrir la configuración</li>
                    <li>Inicia sesión con tu cuenta de Facebook/Meta</li>
                    <li>Selecciona tu cuenta de WhatsApp Business</li>
                    <li>Verifica tu número de teléfono</li>
                    <li>Regresa aquí y haz clic en &quot;Verificar conexión&quot;</li>
                  </ol>
                </div>

                <Button onClick={openSetupLink} className="w-full" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir configuración de WhatsApp
                </Button>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Importante:</strong> Necesitas una cuenta de WhatsApp Business 
                    vinculada a Facebook/Meta Business Suite.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={handleVerifyWhatsAppConnection}
                  disabled={isCheckingWhatsApp}
                  className="w-full"
                >
                  {isCheckingWhatsApp ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Ya completé la configuración
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Error al generar el enlace. Por favor intenta de nuevo.
                </p>
                <Button onClick={handleConnectWhatsApp} className="mt-4">
                  Reintentar
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Phone Number Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar número de teléfono</DialogTitle>
            <DialogDescription>
              Ingresa el número que usarás para llamadas con tus agentes de IA
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Select value={newCountry} onValueChange={setNewCountry}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MX">México (+52)</SelectItem>
                  <SelectItem value="US">Estados Unidos (+1)</SelectItem>
                  <SelectItem value="CO">Colombia (+57)</SelectItem>
                  <SelectItem value="AR">Argentina (+54)</SelectItem>
                  <SelectItem value="ES">España (+34)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de teléfono *</Label>
              <Input
                placeholder="55 1234 5678"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Solo los dígitos, sin el código de país
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
            
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                <strong>Siguiente paso:</strong> Después de agregar el número, 
                deberás asignarle un agente de IA para que pueda responder llamadas.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPhoneNumber} disabled={isSubmitting || !newPhoneNumber.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Agregar número
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Agent Dialog */}
      <Dialog open={showAssignAgentDialog} onOpenChange={setShowAssignAgentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Asignar agente al número</DialogTitle>
            <DialogDescription>
              El agente seleccionado responderá automáticamente las llamadas a este número
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium">{selectedPhoneNumber?.friendlyName}</p>
              <p className="text-sm font-mono text-muted-foreground">
                {selectedPhoneNumber?.phoneNumber}
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
                        <Badge variant="secondary" className="text-xs ml-2">
                          {agent.template.toLowerCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {agents.length === 0 && (
                <p className="text-xs text-amber-600">
                  No tienes agentes creados. Primero crea un agente en la sección de Agentes.
                </p>
              )}
            </div>

            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>¿Cómo funciona?</strong> Cuando alguien llame a este número, 
                el agente contestará automáticamente con su voz y configuración.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssignAgentDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignAgent} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {selectedAgentId ? "Asignar agente" : "Quitar agente"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este número?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El número dejará de recibir llamadas 
              y se desvinculará del agente asignado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePhoneNumber}
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
