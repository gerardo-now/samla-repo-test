"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  QrCode,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectedChannel {
  id: string;
  type: "whatsapp" | "phone";
  name: string;
  phoneNumber?: string;
  isConnected: boolean;
  connectedAt?: Date;
}

// Mock data - in production this comes from API
const mockChannels: ConnectedChannel[] = [];

export function ChannelsSettings() {
  const [channels, setChannels] = useState<ConnectedChannel[]>(mockChannels);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [connectionStep, setConnectionStep] = useState<"info" | "qr" | "verify" | "success">("info");
  const [isConnecting, setIsConnecting] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");

  const whatsappConnected = channels.some(c => c.type === "whatsapp" && c.isConnected);
  const phoneConnected = channels.some(c => c.type === "phone" && c.isConnected);

  const handleConnectWhatsApp = async () => {
    setConnectionStep("info");
    setShowWhatsAppDialog(true);
  };

  const startWhatsAppConnection = async () => {
    setIsConnecting(true);
    setConnectionStep("qr");
    
    // Simulate QR code generation - in production calls /api/channels/whatsapp/connect
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnecting(false);
  };

  const simulateWhatsAppVerify = async () => {
    setIsConnecting(true);
    setConnectionStep("verify");
    
    // Simulate verification - in production polls /api/channels/whatsapp/status
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setConnectionStep("success");
    setChannels(prev => [...prev, {
      id: "wa-1",
      type: "whatsapp",
      name: "WhatsApp Business",
      phoneNumber: "+52 55 1234 5678",
      isConnected: true,
      connectedAt: new Date(),
    }]);
    setIsConnecting(false);
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
      phoneNumber: phoneNumber,
      isConnected: true,
      connectedAt: new Date(),
    }]);
    setIsConnecting(false);
    setShowPhoneDialog(false);
  };

  const handleDisconnect = (channelId: string) => {
    setChannels(prev => prev.filter(c => c.id !== channelId));
  };

  return (
    <div className="space-y-6">
      {/* WhatsApp Section */}
      <Card>
        <CardHeader>
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

      {/* WhatsApp Connection Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connectionStep === "success" ? "¡WhatsApp conectado!" : "Conectar WhatsApp Business"}
            </DialogTitle>
            <DialogDescription>
              {connectionStep === "info" && "Vincula tu cuenta de WhatsApp Business para empezar a recibir mensajes"}
              {connectionStep === "qr" && "Escanea el código QR con tu teléfono"}
              {connectionStep === "verify" && "Verificando conexión..."}
              {connectionStep === "success" && "Tu WhatsApp Business está listo para recibir mensajes"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-6">
            {connectionStep === "info" && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-muted">
                  <h4 className="font-medium mb-2">Requisitos:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Cuenta de WhatsApp Business activa</li>
                    <li>• Acceso a tu teléfono para escanear el código QR</li>
                    <li>• Número no vinculado a otra plataforma</li>
                  </ul>
                </div>
                <Button onClick={startWhatsAppConnection} className="w-full" disabled={isConnecting}>
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4 mr-2" />
                  )}
                  Generar código QR
                </Button>
              </div>
            )}

            {connectionStep === "qr" && (
              <div className="text-center space-y-4">
                {isConnecting ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Placeholder QR code - in production this is a real QR */}
                    <div className="w-48 h-48 mx-auto bg-white border-2 rounded-lg flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-gray-800" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Abre WhatsApp en tu teléfono → Dispositivos vinculados → Vincular un dispositivo
                    </p>
                    <Button onClick={simulateWhatsAppVerify} disabled={isConnecting}>
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Ya escaneé el código
                    </Button>
                  </>
                )}
              </div>
            )}

            {connectionStep === "verify" && (
              <div className="text-center py-8">
                <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Verificando conexión...</p>
              </div>
            )}

            {connectionStep === "success" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <p className="font-medium mb-1">+52 55 1234 5678</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Tu WhatsApp Business está conectado y listo
                </p>
                <Button onClick={() => setShowWhatsAppDialog(false)}>
                  Continuar
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
