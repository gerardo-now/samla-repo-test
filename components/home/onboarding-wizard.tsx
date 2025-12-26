"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
  MessageSquare,
  Bot,
  Calendar,
  Building2,
  Users,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  X,
  Plus,
  Mail,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Step types
type StepType = "welcome" | "workspace" | "team" | "ready";

interface TeamMember {
  email: string;
  role: "admin" | "member";
}

// Industries in Spanish
const industries = [
  { value: "servicios_profesionales", label: "Servicios profesionales" },
  { value: "salud", label: "Salud y bienestar" },
  { value: "educacion", label: "Educación" },
  { value: "inmobiliaria", label: "Inmobiliaria" },
  { value: "restaurantes", label: "Restaurantes y alimentos" },
  { value: "retail", label: "Comercio / Retail" },
  { value: "automotriz", label: "Automotriz" },
  { value: "legal", label: "Legal" },
  { value: "finanzas", label: "Finanzas y seguros" },
  { value: "tecnologia", label: "Tecnología" },
  { value: "otro", label: "Otro" },
];

// Timezones for LATAM and Spain
const timezones = [
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Monterrey", label: "Monterrey (GMT-6)" },
  { value: "America/Tijuana", label: "Tijuana (GMT-8)" },
  { value: "America/Cancun", label: "Cancún (GMT-5)" },
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Lima", label: "Lima (GMT-5)" },
  { value: "America/Santiago", label: "Santiago (GMT-4)" },
  { value: "America/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "America/Sao_Paulo", label: "São Paulo (GMT-3)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
];

export function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepType>("welcome");
  const [isLoading, setIsLoading] = useState(false);

  // Workspace data
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("");
  const [timezone, setTimezone] = useState("America/Mexico_City");

  // Team invitations
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "member">("member");

  useEffect(() => {
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem("samla_onboarding_complete");
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: StepType[] = ["welcome", "workspace", "team", "ready"];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = async () => {
    if (currentStep === "workspace") {
      // Validate workspace data
      if (!workspaceName.trim()) {
        toast.error("Por favor ingresa el nombre de tu empresa");
        return;
      }
      if (!industry) {
        toast.error("Por favor selecciona tu industria");
        return;
      }
    }

    if (currentStep === "ready") {
      await handleComplete();
      return;
    }

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex]);
    }
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleAddTeamMember = () => {
    if (!newEmail.trim()) return;

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error("Por favor ingresa un correo válido");
      return;
    }

    // Check for duplicates
    if (teamMembers.some(m => m.email.toLowerCase() === newEmail.toLowerCase())) {
      toast.error("Este correo ya fue agregado");
      return;
    }

    setTeamMembers([...teamMembers, { email: newEmail, role: newRole }]);
    setNewEmail("");
    setNewRole("member");
  };

  const handleRemoveTeamMember = (email: string) => {
    setTeamMembers(teamMembers.filter(m => m.email !== email));
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Create workspace
      const workspaceRes = await fetch("/api/workspace/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName,
          industry,
          timezone,
        }),
      });

      if (!workspaceRes.ok) {
        throw new Error("Error al crear el espacio de trabajo");
      }

      const { workspaceId } = await workspaceRes.json();

      // Send invitations if any
      if (teamMembers.length > 0) {
        const inviteRes = await fetch("/api/workspace/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            invitations: teamMembers,
          }),
        });

        if (!inviteRes.ok) {
          console.error("Error sending invitations");
          // Don't fail completely, workspace was created
        }
      }

      localStorage.setItem("samla_onboarding_complete", "true");
      toast.success("¡Bienvenido a SAMLA!");
      setIsOpen(false);

      // Reload to show new workspace
      window.location.reload();
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Hubo un error. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("samla_onboarding_complete", "true");
    setIsOpen(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "welcome":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-primary" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-2xl mb-2">¡Bienvenido a SAMLA!</DialogTitle>
              <DialogDescription className="text-base">
                Vamos a configurar tu espacio de trabajo en menos de 2 minutos.
                Tu equipo podrá atender clientes 24/7 con agentes de IA.
              </DialogDescription>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">WhatsApp</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Bot className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">Agentes IA</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-sm font-medium">Citas</p>
              </div>
            </div>
          </div>
        );

      case "workspace":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <DialogTitle className="text-xl mb-2">Tu empresa</DialogTitle>
              <DialogDescription>
                Cuéntanos sobre tu negocio para personalizar tu experiencia
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName">Nombre de tu empresa *</Label>
                <Input
                  id="workspaceName"
                  placeholder="Ej: Clínica Dental García"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industria *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tu industria" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Zona horaria</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <DialogTitle className="text-xl mb-2">Invita a tu equipo</DialogTitle>
              <DialogDescription>
                Agrega a las personas que usarán SAMLA contigo (opcional)
              </DialogDescription>
            </div>

            <div className="space-y-4">
              {/* Add member form */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTeamMember()}
                  />
                </div>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "member")}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Miembro</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAddTeamMember} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Team members list */}
              {teamMembers.length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.email}</p>
                          <Badge variant="secondary" className="text-xs">
                            {member.role === "admin" ? "Administrador" : "Miembro"}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveTeamMember(member.email)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay invitaciones aún</p>
                  <p className="text-xs mt-1">Puedes invitar después desde Configuración</p>
                </div>
              )}

              {teamMembers.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  Se enviarán invitaciones por correo cuando termines la configuración
                </p>
              )}
            </div>
          </div>
        );

      case "ready":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-2xl mb-2">¡Todo listo!</DialogTitle>
              <DialogDescription className="text-base">
                Tu espacio de trabajo está configurado. Ahora sigue los pasos del checklist 
                para conectar tus canales y crear tu primer agente.
              </DialogDescription>
            </div>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{workspaceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {industries.find(i => i.value === industry)?.label}
                  </p>
                </div>
              </div>
              {teamMembers.length > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">
                    {teamMembers.length} {teamMembers.length === 1 ? "invitación" : "invitaciones"} pendientes
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Configuración inicial</DialogTitle>
        </DialogHeader>

        {renderStepContent()}

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 py-4">
          {steps.map((step, index) => (
            <div
              key={step}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentStepIndex
                  ? "w-6 bg-primary"
                  : index < currentStepIndex
                  ? "bg-primary/60"
                  : "bg-muted-foreground/30"
              )}
            />
          ))}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {currentStep === "welcome" && (
            <Button variant="ghost" onClick={handleSkip} className="sm:mr-auto">
              Configurar después
            </Button>
          )}

          {currentStepIndex > 0 && currentStep !== "welcome" && (
            <Button variant="ghost" onClick={handleBack} className="sm:mr-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          )}

          {currentStep === "team" && (
            <Button variant="ghost" onClick={handleNext}>
              Saltar
            </Button>
          )}

          <Button onClick={handleNext} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : currentStep === "ready" ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                ¡Empezar a usar SAMLA!
              </>
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

