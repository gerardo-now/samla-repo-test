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
  Plus,
  Phone,
  Check,
  MoreHorizontal,
  Loader2,
  PhoneCall,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface CallerId {
  id: string;
  phoneNumber: string;
  friendlyName?: string;
  isVerified: boolean;
  isDefault: boolean;
  createdAt: Date;
}

// Mock data - in production comes from API
const initialCallerIds: CallerId[] = [];

export function CallerIdSettings() {
  const [callerIds, setCallerIds] = useState<CallerId[]>(initialCallerIds);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [selectedCallerId, setSelectedCallerId] = useState<CallerId | null>(null);
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [friendlyName, setFriendlyName] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"form" | "calling" | "code" | "success">("form");
  const [error, setError] = useState("");

  const handleAddNumber = async () => {
    if (!phoneNumber) return;
    
    setError("");
    setIsLoading(true);
    setStep("calling");
    
    // Simulate API call to initiate verification
    // In production: POST /api/caller-id/verify/initiate
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setStep("code");
    setIsLoading(false);
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) {
      setError("El código debe tener 6 dígitos");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    // Simulate API call to verify code
    // In production: POST /api/caller-id/verify/confirm
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add the new caller ID
    const newCallerId: CallerId = {
      id: `cid-${Date.now()}`,
      phoneNumber: phoneNumber,
      friendlyName: friendlyName || undefined,
      isVerified: true,
      isDefault: callerIds.length === 0,
      createdAt: new Date(),
    };
    
    setCallerIds(prev => [...prev, newCallerId]);
    setStep("success");
    setIsLoading(false);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
    setPhoneNumber("");
    setFriendlyName("");
    setVerificationCode("");
    setStep("form");
    setError("");
  };

  const handleSetDefault = (id: string) => {
    setCallerIds(prev => prev.map(c => ({
      ...c,
      isDefault: c.id === id,
    })));
  };

  const handleDelete = (id: string) => {
    setCallerIds(prev => {
      const filtered = prev.filter(c => c.id !== id);
      // If we deleted the default, make the first one default
      if (filtered.length > 0 && !filtered.some(c => c.isDefault)) {
        filtered[0].isDefault = true;
      }
      return filtered;
    });
  };

  const handleRetryVerification = (callerId: CallerId) => {
    setSelectedCallerId(callerId);
    setPhoneNumber(callerId.phoneNumber);
    setFriendlyName(callerId.friendlyName || "");
    setVerificationCode("");
    setStep("form");
    setShowVerifyDialog(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Números para llamadas salientes</CardTitle>
              <CardDescription>
                Agrega y verifica los números de teléfono de tu empresa que aparecerán
                como identificador en las llamadas que realicen tus agentes
              </CardDescription>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Agregar número
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {callerIds.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <Phone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">Sin números configurados</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                Agrega el número de teléfono de tu empresa para que tus clientes
                lo vean cuando reciban llamadas de tus agentes
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar mi primer número
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {callerIds.map((callerId) => (
                <div
                  key={callerId.id}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-lg border transition-colors",
                    callerId.isDefault && "bg-primary/5 border-primary/20"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      callerId.isVerified 
                        ? "bg-green-500/10" 
                        : "bg-yellow-500/10"
                    )}>
                      {callerId.isVerified ? (
                        <ShieldCheck className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium font-mono">{callerId.phoneNumber}</p>
                        {callerId.isDefault && (
                          <Badge variant="default" className="text-xs">
                            <Star className="h-3 w-3 mr-1" />
                            Principal
                          </Badge>
                        )}
                      </div>
                      {callerId.friendlyName && (
                        <p className="text-sm text-muted-foreground">
                          {callerId.friendlyName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={callerId.isVerified ? "outline" : "secondary"}>
                      {callerId.isVerified ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Verificado
                        </>
                      ) : (
                        "Pendiente"
                      )}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!callerId.isDefault && callerId.isVerified && (
                          <DropdownMenuItem onClick={() => handleSetDefault(callerId.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Hacer principal
                          </DropdownMenuItem>
                        )}
                        {!callerId.isVerified && (
                          <DropdownMenuItem onClick={() => handleRetryVerification(callerId)}>
                            <PhoneCall className="h-4 w-4 mr-2" />
                            Verificar ahora
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDelete(callerId.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <PhoneCall className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium mb-1">¿Cómo funciona?</h4>
              <p className="text-sm text-muted-foreground">
                Cuando agregas un número, te llamaremos a ese teléfono con un código de verificación.
                Una vez verificado, ese número aparecerá como el identificador cuando tus agentes
                realicen llamadas salientes a tus clientes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Number Dialog */}
      <Dialog open={showAddDialog} onOpenChange={handleCloseAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === "success" ? "¡Número verificado!" : "Agregar número de teléfono"}
            </DialogTitle>
            <DialogDescription>
              {step === "form" && "Ingresa el número de teléfono de tu empresa"}
              {step === "calling" && "Estamos llamando a tu teléfono..."}
              {step === "code" && "Ingresa el código que escuchaste en la llamada"}
              {step === "success" && "Tu número está listo para usarse"}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {step === "form" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Número de teléfono</Label>
                  <Input
                    id="phone"
                    placeholder="+52 55 1234 5678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Incluye el código de país (ej: +52 para México)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre descriptivo (opcional)</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Oficina principal, Ventas, Soporte"
                    value={friendlyName}
                    onChange={(e) => setFriendlyName(e.target.value)}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
            )}

            {step === "calling" && (
              <div className="text-center py-8">
                <div className="relative w-20 h-20 mx-auto mb-4">
                  <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                  <div className="relative w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <PhoneCall className="h-8 w-8 text-primary animate-pulse" />
                  </div>
                </div>
                <p className="font-medium mb-1">Llamando a {phoneNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Contesta la llamada y escucha el código de 6 dígitos
                </p>
              </div>
            )}

            {step === "code" && (
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">
                    Ingresa el código de 6 dígitos que escuchaste
                  </p>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl font-mono tracking-widest"
                    maxLength={6}
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive text-center">{error}</p>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  ¿No recibiste la llamada?{" "}
                  <button
                    className="text-primary hover:underline"
                    onClick={handleAddNumber}
                    disabled={isLoading}
                  >
                    Volver a llamar
                  </button>
                </p>
              </div>
            )}

            {step === "success" && (
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <p className="font-medium font-mono mb-1">{phoneNumber}</p>
                {friendlyName && (
                  <p className="text-sm text-muted-foreground mb-2">{friendlyName}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Este número ahora aparecerá como identificador en las llamadas salientes
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            {step === "form" && (
              <>
                <Button variant="outline" onClick={handleCloseAddDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleAddNumber} disabled={!phoneNumber || isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Verificar número
                </Button>
              </>
            )}
            {step === "code" && (
              <>
                <Button variant="outline" onClick={handleCloseAddDialog}>
                  Cancelar
                </Button>
                <Button onClick={handleVerifyCode} disabled={verificationCode.length !== 6 || isLoading}>
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirmar código
                </Button>
              </>
            )}
            {step === "success" && (
              <Button onClick={handleCloseAddDialog} className="w-full">
                Continuar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
