"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
} from "lucide-react";
import { toast } from "sonner";

interface ConnectedChannel {
  id: string;
  type: "whatsapp" | "phone";
  name: string;
  phoneNumber?: string;
  isConnected: boolean;
  connectedAt?: Date;
}

// Mock workspace ID - in production this comes from context/auth
const WORKSPACE_ID = "demo-workspace";
const WORKSPACE_NAME = "Mi Empresa";

export function ChannelsSettings() {
  const [channels, setChannels] = useState<ConnectedChannel[]>([]);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");

  const whatsappConnected = channels.some(c => c.type === "whatsapp" && c.isConnected);
  const phoneConnected = channels.some(c => c.type === "phone" && c.isConnected);

  // Check connection status on mount
  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(
        `/api/channels/whatsapp/connect?workspaceId=${WORKSPACE_ID}`
      );
      const data = await response.json();

      if (data.connected && data.phoneNumbers?.length > 0) {
        setChannels(prev => {
          // Remove old WhatsApp channels and add new ones
          const nonWhatsApp = prev.filter(c => c.type !== "whatsapp");
          const newWhatsApp = data.phoneNumbers.map((pn: { id: string; phoneNumber: string; displayName?: string }) => ({
            id: pn.id,
            type: "whatsapp" as const,
            name: pn.displayName || "WhatsApp Business",
            phoneNumber: pn.phoneNumber,
            isConnected: true,
            connectedAt: new Date(),
          }));
          return [...nonWhatsApp, ...newWhatsApp];
        });
      }
    } catch (error) {
      console.error("Error checking WhatsApp status:", error);
    } finally {
      setIsChecking(false);
    }
  };

  const handleConnectWhatsApp = async () => {
    setShowWhatsAppDialog(true);
    setSetupUrl(null);
    setIsConnecting(true);

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
      setIsConnecting(false);
    }
  };

  const openSetupLink = () => {
    if (setupUrl) {
      window.open(setupUrl, "_blank", "noopener,noreferrer");
      toast.info("Completa la configuración en la nueva ventana");
    }
  };

  const handleVerifyConnection = async () => {
    setIsChecking(true);
    await checkWhatsAppStatus();
    
    if (whatsappConnected) {
      toast.success("¡WhatsApp conectado exitosamente!");
      setShowWhatsAppDialog(false);
    } else {
      toast.info("Aún no detectamos la conexión. Completa el proceso en la otra ventana.");
    }
    setIsChecking(false);
  };

  const handleConnectPhone = () => {
    setPhoneNumber("");
    setShowPhoneDialog(true);
  };

  const handlePhoneSubmit = async () => {
    if (!phoneNumber) return;
    
    setIsConnecting(true);
    // Simulate API call - in production calls /api/channels/phone/connect
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setChannels(prev => [...prev, {
      id: "phone-1",
      type: "phone",
      name: "Línea principal",
      phoneNumber: `+52 ${phoneNumber}`,
      isConnected: true,
      connectedAt: new Date(),
    }]);
    setIsConnecting(false);
    setShowPhoneDialog(false);
    toast.success("Número telefónico activado");
  };

  const handleDisconnect = (channelId: string) => {
    setChannels(prev => prev.filter(c => c.id !== channelId));
    toast.success("Canal desconectado");
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
                disabled={isChecking}
              >
                <RefreshCw className={`h-4 w-4 ${isChecking ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {whatsappConnected ? (
            <div className="space-y-4">
              {channels.filter(c => c.type === "whatsapp").map(channel => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{channel.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Conectado · Recibiendo mensajes
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(channel.id)}
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
        </CardHeader>
        <CardContent>
          {phoneConnected ? (
            <div className="space-y-4">
              {channels.filter(c => c.type === "phone").map(channel => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20"
                >
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{channel.phoneNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        Activo · Listo para llamadas
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(channel.id)}
                  >
                    <Unlink className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Activa las llamadas telefónicas</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Obtén un número telefónico para que tus agentes de IA puedan
                recibir y realizar llamadas
              </p>
              <Button onClick={handleConnectPhone}>
                <Link2 className="h-4 w-4 mr-2" />
                Activar llamadas
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Connection Dialog - Updated for Setup Links */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp Business</DialogTitle>
            <DialogDescription>
              Vincula tu cuenta de WhatsApp Business para empezar a recibir mensajes
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {isConnecting ? (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generando enlace de configuración...</p>
              </div>
            ) : setupUrl ? (
              <div className="space-y-6">
                {/* Instructions */}
                <div className="p-4 rounded-lg bg-muted space-y-3">
                  <h4 className="font-medium">Instrucciones:</h4>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Haz clic en el botón de abajo para abrir la configuración</li>
                    <li>Inicia sesión con tu cuenta de Facebook/Meta</li>
                    <li>Selecciona tu cuenta de WhatsApp Business</li>
                    <li>Verifica tu número de teléfono</li>
                    <li>Regresa aquí y haz clic en "Verificar conexión"</li>
                  </ol>
                </div>

                {/* Open Setup Link Button */}
                <Button onClick={openSetupLink} className="w-full" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir configuración de WhatsApp
                </Button>

                {/* Requirements notice */}
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Importante:</strong> Necesitas una cuenta de WhatsApp Business 
                    vinculada a Facebook/Meta Business Suite.
                  </p>
                </div>

                {/* Verify Button */}
                <Button
                  variant="outline"
                  onClick={handleVerifyConnection}
                  disabled={isChecking}
                  className="w-full"
                >
                  {isChecking ? (
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

      {/* Phone Connection Dialog */}
      <Dialog open={showPhoneDialog} onOpenChange={setShowPhoneDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Activar llamadas telefónicas</DialogTitle>
            <DialogDescription>
              Te asignaremos un número telefónico para recibir y realizar llamadas
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>País</Label>
              <Input value="México (+52)" disabled />
            </div>
            <div className="space-y-2">
              <Label>Código de área preferido (opcional)</Label>
              <Input
                placeholder="Ej: 55, 33, 81"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Intentaremos asignarte un número con este código de área
              </p>
            </div>
            
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm text-muted-foreground">
                El número asignado podrá recibir llamadas entrantes y realizar
                llamadas salientes con tus agentes de IA.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPhoneDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handlePhoneSubmit} disabled={isConnecting}>
              {isConnecting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Obtener número
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
