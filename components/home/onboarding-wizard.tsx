"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Globe,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { COUNTRIES, BILLING_REGIONS, requiresEnterprise, getSingleRegion, type BillingRegion } from "@/lib/billing/regions";

// Step types
type StepType = "welcome" | "language" | "workspace" | "region" | "team" | "ready";

interface TeamMember {
  email: string;
  role: "admin" | "member";
}

// Supported system languages
const systemLanguages = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "pt", label: "Português" },
];

// Industries (multilingual)
const industries: Record<string, Array<{ value: string; label: string }>> = {
  es: [
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
  ],
  en: [
    { value: "servicios_profesionales", label: "Professional Services" },
    { value: "salud", label: "Health & Wellness" },
    { value: "educacion", label: "Education" },
    { value: "inmobiliaria", label: "Real Estate" },
    { value: "restaurantes", label: "Food & Restaurants" },
    { value: "retail", label: "Retail / Commerce" },
    { value: "automotriz", label: "Automotive" },
    { value: "legal", label: "Legal" },
    { value: "finanzas", label: "Finance & Insurance" },
    { value: "tecnologia", label: "Technology" },
    { value: "otro", label: "Other" },
  ],
  pt: [
    { value: "servicios_profesionales", label: "Serviços Profissionais" },
    { value: "salud", label: "Saúde e Bem-estar" },
    { value: "educacion", label: "Educação" },
    { value: "inmobiliaria", label: "Imobiliário" },
    { value: "restaurantes", label: "Restaurantes e Alimentação" },
    { value: "retail", label: "Varejo / Comércio" },
    { value: "automotriz", label: "Automotivo" },
    { value: "legal", label: "Jurídico" },
    { value: "finanzas", label: "Finanças e Seguros" },
    { value: "tecnologia", label: "Tecnologia" },
    { value: "otro", label: "Outro" },
  ],
};

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
  { value: "America/New_York", label: "New York (GMT-5)" },
  { value: "America/Los_Angeles", label: "Los Angeles (GMT-8)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
  { value: "Europe/London", label: "London (GMT+0)" },
];

// UI Strings per language
const uiStrings: Record<string, Record<string, string>> = {
  es: {
    welcomeTitle: "¡Bienvenido a SAMLA!",
    welcomeDesc: "Vamos a configurar tu espacio de trabajo en menos de 2 minutos. Tu equipo podrá atender clientes 24/7 con agentes de IA.",
    whatsapp: "WhatsApp",
    agents: "Agentes IA",
    appointments: "Citas",
    languageTitle: "Selecciona tu idioma",
    languageDesc: "Este será el idioma de la interfaz del sistema",
    workspaceTitle: "Tu empresa",
    workspaceDesc: "Cuéntanos sobre tu negocio para personalizar tu experiencia",
    companyName: "Nombre de tu empresa",
    companyPlaceholder: "Ej: Clínica Dental García",
    industry: "Industria",
    selectIndustry: "Selecciona tu industria",
    timezone: "Zona horaria",
    teamTitle: "Invita a tu equipo",
    teamDesc: "Agrega a las personas que usarán SAMLA contigo (opcional)",
    addMember: "Agregar",
    admin: "Administrador",
    member: "Miembro",
    noInvites: "No hay invitaciones aún",
    canInviteLater: "Puedes invitar después desde Configuración",
    invitesSent: "Se enviarán invitaciones por correo cuando termines la configuración",
    readyTitle: "¡Todo listo!",
    readyDesc: "Tu espacio de trabajo está configurado. Ahora sigue los pasos del checklist para conectar tus canales y crear tu primer agente.",
    pendingInvites: "invitaciones pendientes",
    continue: "Continuar",
    back: "Atrás",
    skip: "Saltar",
    skipSetup: "Configurar después",
    startUsing: "¡Empezar a usar SAMLA!",
    creating: "Creando...",
    errorCompanyName: "Por favor ingresa el nombre de tu empresa",
    errorIndustry: "Por favor selecciona tu industria",
    errorEmail: "Por favor ingresa un correo válido",
    errorDuplicate: "Este correo ya fue agregado",
    successWelcome: "¡Bienvenido a SAMLA!",
    errorGeneral: "Hubo un error. Por favor intenta de nuevo.",
    regionTitle: "¿Dónde opera tu empresa?",
    regionDesc: "Selecciona los países donde atiendes clientes. Esto determina tu plan de facturación.",
    selectCountries: "Selecciona uno o más países",
    selectedCountries: "países seleccionados",
    multiRegionWarning: "Operas en múltiples regiones",
    multiRegionDesc: "Para operar en más de una región necesitas el plan Enterprise. Te contactaremos para configurar tu cuenta.",
    contactEnterprise: "Contactar ventas",
    errorSelectCountry: "Por favor selecciona al menos un país",
  },
  en: {
    welcomeTitle: "Welcome to SAMLA!",
    welcomeDesc: "Let's set up your workspace in less than 2 minutes. Your team will be able to serve customers 24/7 with AI agents.",
    whatsapp: "WhatsApp",
    agents: "AI Agents",
    appointments: "Appointments",
    languageTitle: "Select your language",
    languageDesc: "This will be the system interface language",
    workspaceTitle: "Your company",
    workspaceDesc: "Tell us about your business to personalize your experience",
    companyName: "Company name",
    companyPlaceholder: "E.g.: Garcia Dental Clinic",
    industry: "Industry",
    selectIndustry: "Select your industry",
    timezone: "Timezone",
    teamTitle: "Invite your team",
    teamDesc: "Add people who will use SAMLA with you (optional)",
    addMember: "Add",
    admin: "Administrator",
    member: "Member",
    noInvites: "No invitations yet",
    canInviteLater: "You can invite later from Settings",
    invitesSent: "Invitations will be sent by email when you finish setup",
    readyTitle: "All set!",
    readyDesc: "Your workspace is configured. Now follow the checklist steps to connect your channels and create your first agent.",
    pendingInvites: "pending invitations",
    continue: "Continue",
    back: "Back",
    skip: "Skip",
    skipSetup: "Set up later",
    startUsing: "Start using SAMLA!",
    creating: "Creating...",
    errorCompanyName: "Please enter your company name",
    errorIndustry: "Please select your industry",
    errorEmail: "Please enter a valid email",
    errorDuplicate: "This email was already added",
    successWelcome: "Welcome to SAMLA!",
    errorGeneral: "An error occurred. Please try again.",
    regionTitle: "Where does your company operate?",
    regionDesc: "Select the countries where you serve customers. This determines your billing plan.",
    selectCountries: "Select one or more countries",
    selectedCountries: "countries selected",
    multiRegionWarning: "You operate in multiple regions",
    multiRegionDesc: "To operate in more than one region you need the Enterprise plan. We'll contact you to set up your account.",
    contactEnterprise: "Contact sales",
    errorSelectCountry: "Please select at least one country",
  },
  pt: {
    welcomeTitle: "Bem-vindo ao SAMLA!",
    welcomeDesc: "Vamos configurar seu espaço de trabalho em menos de 2 minutos. Sua equipe poderá atender clientes 24/7 com agentes de IA.",
    whatsapp: "WhatsApp",
    agents: "Agentes IA",
    appointments: "Agendamentos",
    languageTitle: "Selecione seu idioma",
    languageDesc: "Este será o idioma da interface do sistema",
    workspaceTitle: "Sua empresa",
    workspaceDesc: "Conte-nos sobre seu negócio para personalizar sua experiência",
    companyName: "Nome da empresa",
    companyPlaceholder: "Ex: Clínica Dental García",
    industry: "Indústria",
    selectIndustry: "Selecione sua indústria",
    timezone: "Fuso horário",
    teamTitle: "Convide sua equipe",
    teamDesc: "Adicione pessoas que usarão o SAMLA com você (opcional)",
    addMember: "Adicionar",
    admin: "Administrador",
    member: "Membro",
    noInvites: "Nenhum convite ainda",
    canInviteLater: "Você pode convidar depois em Configurações",
    invitesSent: "Os convites serão enviados por email quando você terminar a configuração",
    readyTitle: "Tudo pronto!",
    readyDesc: "Seu espaço de trabalho está configurado. Agora siga os passos do checklist para conectar seus canais e criar seu primeiro agente.",
    pendingInvites: "convites pendentes",
    continue: "Continuar",
    back: "Voltar",
    skip: "Pular",
    skipSetup: "Configurar depois",
    startUsing: "Começar a usar o SAMLA!",
    creating: "Criando...",
    errorCompanyName: "Por favor, insira o nome da sua empresa",
    errorIndustry: "Por favor, selecione sua indústria",
    errorEmail: "Por favor, insira um email válido",
    errorDuplicate: "Este email já foi adicionado",
    successWelcome: "Bem-vindo ao SAMLA!",
    errorGeneral: "Ocorreu um erro. Por favor, tente novamente.",
    regionTitle: "Onde sua empresa opera?",
    regionDesc: "Selecione os países onde você atende clientes. Isso determina seu plano de faturamento.",
    selectCountries: "Selecione um ou mais países",
    selectedCountries: "países selecionados",
    multiRegionWarning: "Você opera em múltiplas regiões",
    multiRegionDesc: "Para operar em mais de uma região você precisa do plano Enterprise. Entraremos em contato para configurar sua conta.",
    contactEnterprise: "Contatar vendas",
    errorSelectCountry: "Por favor, selecione pelo menos um país",
  },
};

export function OnboardingWizard() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepType>("welcome");
  const [isLoading, setIsLoading] = useState(false);

  // Language
  const [language, setLanguage] = useState("es");

  // Workspace data
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("");
  const [timezone, setTimezone] = useState("America/Mexico_City");

  // Region/Country selection
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showEnterpriseRedirect, setShowEnterpriseRedirect] = useState(false);

  // Team invitations
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<"admin" | "member">("member");

  // Get UI strings for current language
  const t = uiStrings[language] || uiStrings.es;
  const currentIndustries = industries[language] || industries.es;

  // Check if multiple regions selected -> Enterprise required
  const isMultiRegion = requiresEnterprise(selectedCountries);
  const billingRegion = getSingleRegion(selectedCountries);

  useEffect(() => {
    // Check if user needs onboarding
    const hasCompletedOnboarding = localStorage.getItem("samla_onboarding_complete");
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const steps: StepType[] = ["welcome", "language", "workspace", "region", "team", "ready"];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleNext = async () => {
    if (currentStep === "workspace") {
      if (!workspaceName.trim()) {
        toast.error(t.errorCompanyName);
        return;
      }
      if (!industry) {
        toast.error(t.errorIndustry);
        return;
      }
    }

    if (currentStep === "region") {
      if (selectedCountries.length === 0) {
        toast.error(t.errorSelectCountry);
        return;
      }
      // If multiple regions, show Enterprise redirect
      if (isMultiRegion) {
        setShowEnterpriseRedirect(true);
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

  const toggleCountry = (countryCode: string) => {
    setSelectedCountries(prev => 
      prev.includes(countryCode)
        ? prev.filter(c => c !== countryCode)
        : [...prev, countryCode]
    );
  };

  const handleEnterpriseContact = () => {
    // Open email or contact form
    window.open("mailto:enterprise@samla.io?subject=Enterprise%20Plan%20-%20Multi-Region", "_blank");
    toast.success(language === "es" 
      ? "Te contactaremos pronto" 
      : language === "pt" 
      ? "Entraremos em contato em breve"
      : "We'll contact you soon"
    );
  };

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex]);
    }
  };

  const handleAddTeamMember = () => {
    if (!newEmail.trim()) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error(t.errorEmail);
      return;
    }

    if (teamMembers.some(m => m.email.toLowerCase() === newEmail.toLowerCase())) {
      toast.error(t.errorDuplicate);
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
      // Save language preference
      localStorage.setItem("samla_language", language);

      // Create workspace
      const workspaceRes = await fetch("/api/workspace/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: workspaceName,
          industry,
          timezone,
          language,
          countries: selectedCountries,
          billingRegion: billingRegion || "LATAM",
        }),
      });

      if (!workspaceRes.ok) {
        throw new Error("Error creating workspace");
      }

      const { workspaceId } = await workspaceRes.json();

      // Send invitations if any
      if (teamMembers.length > 0) {
        await fetch("/api/workspace/invite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workspaceId,
            invitations: teamMembers,
          }),
        });
      }

      localStorage.setItem("samla_onboarding_complete", "true");
      toast.success(t.successWelcome);
      setIsOpen(false);

      window.location.reload();
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(t.errorGeneral);
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
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl mb-2">{t.welcomeTitle}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {t.welcomeDesc}
              </DialogDescription>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-4">
              <div className="text-center p-2 sm:p-4 rounded-lg bg-muted/50">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-green-600" />
                <p className="text-xs sm:text-sm font-medium">{t.whatsapp}</p>
              </div>
              <div className="text-center p-2 sm:p-4 rounded-lg bg-muted/50">
                <Bot className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-blue-600" />
                <p className="text-xs sm:text-sm font-medium">{t.agents}</p>
              </div>
              <div className="text-center p-2 sm:p-4 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-purple-600" />
                <p className="text-xs sm:text-sm font-medium">{t.appointments}</p>
              </div>
            </div>
          </div>
        );

      case "language":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                  <Globe className="h-7 w-7 sm:h-8 sm:w-8 text-indigo-600" />
                </div>
              </div>
              <DialogTitle className="text-lg sm:text-xl mb-2">{t.languageTitle}</DialogTitle>
              <DialogDescription className="text-sm">
                {t.languageDesc}
              </DialogDescription>
            </div>

            <div className="grid gap-3">
              {systemLanguages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={cn(
                    "flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                    language === lang.value
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <span className="font-medium">{lang.label}</span>
                  {language === lang.value && (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        );

      case "workspace":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <Building2 className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </div>
              <DialogTitle className="text-lg sm:text-xl mb-2">{t.workspaceTitle}</DialogTitle>
              <DialogDescription className="text-sm">
                {t.workspaceDesc}
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workspaceName" className="text-sm">{t.companyName} *</Label>
                <Input
                  id="workspaceName"
                  placeholder={t.companyPlaceholder}
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  autoFocus
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm">{t.industry} *</Label>
                <Select value={industry} onValueChange={setIndustry}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder={t.selectIndustry} />
                  </SelectTrigger>
                  <SelectContent>
                    {currentIndustries.map((ind) => (
                      <SelectItem key={ind.value} value={ind.value}>
                        {ind.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="text-sm">{t.timezone}</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger className="h-11">
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

      case "region":
        // Group countries by region for display
        const countriesByRegion = Object.entries(BILLING_REGIONS).map(([key, region]) => ({
          region: key as BillingRegion,
          name: language === "es" ? region.nameEs : region.name,
          countries: COUNTRIES.filter(c => c.region === key),
        }));

        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <MapPin className="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600" />
                </div>
              </div>
              <DialogTitle className="text-lg sm:text-xl mb-2">{t.regionTitle}</DialogTitle>
              <DialogDescription className="text-sm">
                {t.regionDesc}
              </DialogDescription>
            </div>

            {/* Multi-region warning */}
            {isMultiRegion && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">{t.multiRegionWarning}</p>
                    <p className="text-sm text-amber-700 mt-1">{t.multiRegionDesc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Selected countries badge */}
            {selectedCountries.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-sm">
                  {selectedCountries.length} {t.selectedCountries}
                </Badge>
                {billingRegion && !isMultiRegion && (
                  <Badge variant="outline" className="text-sm">
                    {language === "es" ? BILLING_REGIONS[billingRegion].nameEs : BILLING_REGIONS[billingRegion].name}
                  </Badge>
                )}
              </div>
            )}

            {/* Countries by region */}
            <div className="space-y-4 max-h-[280px] overflow-y-auto pr-2">
              {countriesByRegion.map(({ region, name, countries }) => (
                <div key={region}>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    {name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {countries.slice(0, 8).map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => toggleCountry(country.code)}
                        className={cn(
                          "flex items-center gap-2 p-2.5 rounded-lg border text-left text-sm transition-all",
                          selectedCountries.includes(country.code)
                            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                            : "border-border hover:border-primary/40 hover:bg-muted/30"
                        )}
                      >
                        <Checkbox
                          checked={selectedCountries.includes(country.code)}
                          className="pointer-events-none"
                        />
                        <span className="truncate">
                          {language === "es" ? country.nameEs : country.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "team":
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                  <Users className="h-7 w-7 sm:h-8 sm:w-8 text-purple-600" />
                </div>
              </div>
              <DialogTitle className="text-lg sm:text-xl mb-2">{t.teamTitle}</DialogTitle>
              <DialogDescription className="text-sm">
                {t.teamDesc}
              </DialogDescription>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTeamMember()}
                    className="h-11"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={newRole} onValueChange={(v) => setNewRole(v as "admin" | "member")}>
                    <SelectTrigger className="w-full sm:w-32 h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">{t.admin}</SelectItem>
                      <SelectItem value="member">{t.member}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={handleAddTeamMember} size="icon" className="h-11 w-11 shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {teamMembers.length > 0 ? (
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {teamMembers.map((member) => (
                    <div
                      key={member.email}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{member.email}</p>
                          <Badge variant="secondary" className="text-xs">
                            {member.role === "admin" ? t.admin : t.member}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
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
                  <p className="text-sm">{t.noInvites}</p>
                  <p className="text-xs mt-1">{t.canInviteLater}</p>
                </div>
              )}

              {teamMembers.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {t.invitesSent}
                </p>
              )}
            </div>
          </div>
        );

      case "ready":
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-green-600" />
              </div>
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl mb-2">{t.readyTitle}</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                {t.readyDesc}
              </DialogDescription>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{workspaceName}</p>
                  <p className="text-xs text-muted-foreground">
                    {currentIndustries.find(i => i.value === industry)?.label}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm">
                  {systemLanguages.find(l => l.value === language)?.label}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                <p className="text-sm">
                  {selectedCountries.length} {t.selectedCountries} · {billingRegion && (language === "es" ? BILLING_REGIONS[billingRegion].nameEs : BILLING_REGIONS[billingRegion].name)}
                </p>
              </div>
              {teamMembers.length > 0 && (
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground shrink-0" />
                  <p className="text-sm">
                    {teamMembers.length} {t.pendingInvites}
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
        className="sm:max-w-lg max-h-[90vh] overflow-y-auto"
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
            <Button variant="ghost" onClick={handleSkip} className="sm:mr-auto order-2 sm:order-1">
              {t.skipSetup}
            </Button>
          )}

          {currentStepIndex > 0 && currentStep !== "welcome" && (
            <Button variant="ghost" onClick={handleBack} className="sm:mr-auto order-2 sm:order-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t.back}
            </Button>
          )}

          {currentStep === "team" && (
            <Button variant="ghost" onClick={handleNext} className="order-3 sm:order-2">
              {t.skip}
            </Button>
          )}

          {/* Enterprise contact button for multi-region */}
          {currentStep === "region" && isMultiRegion ? (
            <Button onClick={handleEnterpriseContact} className="w-full sm:w-auto order-1 sm:order-3">
              {t.contactEnterprise}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isLoading} className="w-full sm:w-auto order-1 sm:order-3">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t.creating}
                </>
              ) : currentStep === "ready" ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {t.startUsing}
                </>
              ) : (
                <>
                  {t.continue}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
