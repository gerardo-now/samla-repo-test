"use client";

import { useState, useEffect } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Calendar,
  ClipboardList,
  Tag,
  Play,
  Globe,
  Loader2,
  Phone,
  UserRound,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  ChevronDown,
  Bot,
} from "lucide-react";
import { toast } from "sonner";

interface TransferConfig {
  enabled: boolean;
  type: "phone" | "agent" | "queue";
  destination?: string;
  destinationName?: string;
  conditions?: string[];
  message?: string;
}

interface AgentEditorProps {
  agent?: {
    id: string;
    name: string;
    template: string;
    tone: string;
    language?: string;
    isActive: boolean;
    transferToHuman?: TransferConfig;
    transferToAgent?: TransferConfig;
    autoEscalateOnFrustration?: boolean;
    autoEscalateOnRequest?: boolean;
    workingHoursEnabled?: boolean;
    workingHoursStart?: string;
    workingHoursEnd?: string;
    workingDays?: number[];
    afterHoursMessage?: string;
  } | null;
  onSave: () => void;
  onCancel: () => void;
}

const templates = [
  { value: "sales", label: UI.agents.templates.sales },
  { value: "support", label: UI.agents.templates.support },
  { value: "collections", label: UI.agents.templates.collections },
  { value: "custom", label: UI.agents.templates.custom },
];

const tones = [
  { value: "professional", label: UI.agents.tones.professional },
  { value: "friendly", label: UI.agents.tones.friendly },
  { value: "formal", label: UI.agents.tones.formal },
  { value: "casual", label: UI.agents.tones.casual },
];

// Agent languages (for AI responses)
const agentLanguages = [
  { value: "es-MX", label: "Español — México" },
  { value: "es-ES", label: "Español — España" },
  { value: "es-AR", label: "Español — Argentina" },
  { value: "es-CO", label: "Español — Colombia" },
  { value: "en-US", label: "English — US" },
  { value: "en-GB", label: "English — UK" },
  { value: "pt-BR", label: "Português — Brasil" },
  { value: "pt-PT", label: "Português — Portugal" },
  { value: "fr-FR", label: "Français" },
  { value: "de-DE", label: "Deutsch" },
  { value: "it-IT", label: "Italiano" },
];

const tools = [
  { id: "sendWhatsapp", label: UI.agents.tools.sendWhatsapp, icon: MessageSquare },
  { id: "scheduleMeeting", label: UI.agents.tools.scheduleMeeting, icon: Calendar },
  { id: "createTask", label: UI.agents.tools.createTask, icon: ClipboardList },
  { id: "tagContact", label: UI.agents.tools.tagContact, icon: Tag },
  { id: "transferHuman", label: "Transferir a humano", icon: UserRound },
  { id: "transferAgent", label: "Transferir a otro agente", icon: Bot },
];

const transferConditions = [
  { id: "escalation", label: "Cliente frustrado o molesto" },
  { id: "request", label: "Cliente solicita hablar con humano" },
  { id: "complex", label: "Pregunta compleja que no puede responder" },
  { id: "high_value", label: "Cliente de alto valor" },
  { id: "complaint", label: "Queja formal" },
];

const weekDays = [
  { value: 0, label: "Dom" },
  { value: 1, label: "Lun" },
  { value: 2, label: "Mar" },
  { value: 3, label: "Mié" },
  { value: 4, label: "Jue" },
  { value: 5, label: "Vie" },
  { value: 6, label: "Sáb" },
];

interface Voice {
  id: string;
  name: string;
  language: string;
  previewUrl?: string;
}

export function AgentEditor({ agent, onSave, onCancel }: AgentEditorProps) {
  const [name, setName] = useState(agent?.name || "");
  const [template, setTemplate] = useState(agent?.template || "sales");
  const [tone, setTone] = useState(agent?.tone || "professional");
  const [language, setLanguage] = useState(agent?.language || "es-MX");
  const [voiceId, setVoiceId] = useState("");
  const [enabledTools, setEnabledTools] = useState<string[]>(["sendWhatsapp", "scheduleMeeting"]);
  const [goals, setGoals] = useState("");
  const [isActive, setIsActive] = useState(agent?.isActive ?? true);

  // Transfer settings
  const [transferHumanEnabled, setTransferHumanEnabled] = useState(agent?.transferToHuman?.enabled ?? true);
  const [transferHumanPhone, setTransferHumanPhone] = useState(agent?.transferToHuman?.destination || "");
  const [transferHumanMessage, setTransferHumanMessage] = useState(
    agent?.transferToHuman?.message || "Te transferiré con un asesor. Un momento por favor."
  );
  const [transferConditionsSelected, setTransferConditionsSelected] = useState<string[]>(
    agent?.transferToHuman?.conditions || ["escalation", "request"]
  );

  // Transfer to another agent
  const [transferAgentEnabled, setTransferAgentEnabled] = useState(agent?.transferToAgent?.enabled ?? false);
  const [transferAgentId, setTransferAgentId] = useState(agent?.transferToAgent?.destination || "");
  const [availableAgents, setAvailableAgents] = useState<Array<{ id: string; name: string }>>([]);

  // Escalation settings
  const [autoEscalateOnFrustration, setAutoEscalateOnFrustration] = useState(agent?.autoEscalateOnFrustration ?? true);
  const [autoEscalateOnRequest, setAutoEscalateOnRequest] = useState(agent?.autoEscalateOnRequest ?? true);

  // Working hours
  const [workingHoursEnabled, setWorkingHoursEnabled] = useState(agent?.workingHoursEnabled ?? false);
  const [workingHoursStart, setWorkingHoursStart] = useState(agent?.workingHoursStart || "09:00");
  const [workingHoursEnd, setWorkingHoursEnd] = useState(agent?.workingHoursEnd || "18:00");
  const [workingDays, setWorkingDays] = useState<number[]>(agent?.workingDays || [1, 2, 3, 4, 5]);
  const [afterHoursMessage, setAfterHoursMessage] = useState(
    agent?.afterHoursMessage || "Nuestro horario es de Lun a Vie, 9am a 6pm. Te contactaremos pronto."
  );

  // Collapsible sections
  const [transferSectionOpen, setTransferSectionOpen] = useState(false);
  const [hoursSectionOpen, setHoursSectionOpen] = useState(false);

  // Voices state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Fetch available agents for transfer
  useEffect(() => {
    fetchAvailableAgents();
  }, []);

  const fetchAvailableAgents = async () => {
    try {
      const response = await fetch("/api/agents");
      const data = await response.json();
      if (data.success && data.agents) {
        // Filter out current agent
        setAvailableAgents(
          data.agents
            .filter((a: { id: string }) => a.id !== agent?.id)
            .map((a: { id: string; name: string }) => ({ id: a.id, name: a.name }))
        );
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const toggleTransferCondition = (conditionId: string) => {
    setTransferConditionsSelected((prev) =>
      prev.includes(conditionId) ? prev.filter((c) => c !== conditionId) : [...prev, conditionId]
    );
  };

  const toggleWorkingDay = (day: number) => {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  // Fetch voices when language changes
  useEffect(() => {
    fetchVoices();
  }, [language]);

  const fetchVoices = async () => {
    setIsLoadingVoices(true);
    try {
      // Get the base language code (e.g., "es" from "es-MX")
      const baseLang = language.split("-")[0];
      const response = await fetch(`/api/voices?language=${baseLang}`);
      const data = await response.json();

      if (data.success && data.voices) {
        setVoices(data.voices);
        // Auto-select first voice if none selected
        if (!voiceId && data.voices.length > 0) {
          setVoiceId(data.voices[0].id);
        }
      }
    } catch (error) {
      console.error("Error fetching voices:", error);
      // Fallback to mock voices
      setVoices([
        { id: "voice-1", name: "Sofia", language: "Spanish" },
        { id: "voice-2", name: "Carlos", language: "Spanish" },
        { id: "voice-3", name: "María", language: "Spanish" },
      ]);
    } finally {
      setIsLoadingVoices(false);
    }
  };

  const handlePreviewVoice = async () => {
    if (!voiceId || isPreviewPlaying) return;

    setIsPreviewPlaying(true);
    try {
      const response = await fetch("/api/voices/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId,
          text: language.startsWith("es")
            ? "Hola, soy tu asistente virtual. ¿En qué puedo ayudarte?"
            : language.startsWith("pt")
            ? "Olá, sou seu assistente virtual. Como posso ajudá-lo?"
            : "Hello, I'm your virtual assistant. How can I help you?",
        }),
      });

      const data = await response.json();
      if (data.audioBase64) {
        const audio = new Audio(data.audioBase64);
        audio.play();
        audio.onended = () => setIsPreviewPlaying(false);
      } else {
        setIsPreviewPlaying(false);
      }
    } catch (error) {
      console.error("Error playing preview:", error);
      toast.error("Error al reproducir la vista previa");
      setIsPreviewPlaying(false);
    }
  };

  const toggleTool = (toolId: string) => {
    setEnabledTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Por favor ingresa un nombre para el agente");
      return;
    }

    // Validate transfer phone if enabled
    if (transferHumanEnabled && !transferHumanPhone.trim()) {
      toast.error("Por favor ingresa un número de teléfono para transferencias");
      return;
    }

    setIsSaving(true);

    try {
      const agentData = {
        id: agent?.id,
        name: name.trim(),
        template,
        tone,
        language,
        voiceId,
        enabledTools,
        goals,
        isActive,
        // Transfer configuration
        transferToHuman: {
          enabled: transferHumanEnabled,
          type: "phone" as const,
          destination: transferHumanPhone,
          conditions: transferConditionsSelected,
          message: transferHumanMessage,
        },
        transferToAgent: transferAgentEnabled ? {
          enabled: true,
          type: "agent" as const,
          destination: transferAgentId,
          destinationName: availableAgents.find(a => a.id === transferAgentId)?.name,
        } : undefined,
        // Escalation settings
        autoEscalateOnFrustration,
        autoEscalateOnRequest,
        // Working hours
        workingHoursEnabled,
        workingHoursStart,
        workingHoursEnd,
        workingDays,
        afterHoursMessage,
      };

      const response = await fetch("/api/agents", {
        method: agent ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(agentData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(agent ? "Agente actualizado" : "Agente creado exitosamente");
        onSave();
      } else {
        toast.error(data.error || "Error al guardar el agente");
      }
    } catch (error) {
      console.error("Error saving agent:", error);
      toast.error("Error al guardar el agente");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{UI.agents.fields.name}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi agente de ventas"
              required
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">{UI.agents.fields.template}</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Language - NEW */}
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Idioma del agente
          </Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agentLanguages.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            El agente responderá a los clientes en este idioma
          </p>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tone">{UI.agents.fields.tone}</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice">{UI.agents.fields.voice}</Label>
            <div className="flex gap-2">
              <Select value={voiceId} onValueChange={setVoiceId} disabled={isLoadingVoices}>
                <SelectTrigger className="flex-1 h-11">
                  {isLoadingVoices ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Cargando...
                    </span>
                  ) : (
                    <SelectValue placeholder="Seleccionar voz" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {voices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!voiceId || isPreviewPlaying}
                onClick={handlePreviewVoice}
                className="h-11 w-11 shrink-0"
              >
                {isPreviewPlaying ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Goals */}
      <div className="space-y-2">
        <Label htmlFor="goals">{UI.agents.fields.goals}</Label>
        <Textarea
          id="goals"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          placeholder="Describe los objetivos del agente. Por ejemplo: Agendar citas con prospectos interesados, responder preguntas sobre productos..."
          rows={3}
          className="resize-none"
        />
      </div>

      <Separator />

      {/* Tools */}
      <div className="space-y-4">
        <Label>{UI.agents.fields.tools}</Label>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => toggleTool(tool.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <tool.icon className="h-4 w-4 text-primary" />
                </div>
                <span className="font-medium text-sm">{tool.label}</span>
              </div>
              <Switch
                checked={enabledTools.includes(tool.id)}
                onCheckedChange={() => toggleTool(tool.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Transfer Configuration */}
      <Collapsible open={transferSectionOpen} onOpenChange={setTransferSectionOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowRightLeft className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Transferencias</p>
              <p className="text-sm text-muted-foreground">
                Configura cuándo y cómo transferir a humanos u otros agentes
              </p>
            </div>
          </div>
          <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${transferSectionOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-6 pt-4">
          {/* Transfer to Human */}
          <div className="space-y-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <UserRound className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Transferir a humano</p>
                  <p className="text-sm text-muted-foreground">Número de teléfono para transferir llamadas</p>
                </div>
              </div>
              <Switch checked={transferHumanEnabled} onCheckedChange={setTransferHumanEnabled} />
            </div>

            {transferHumanEnabled && (
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Número de teléfono</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="+52 55 1234 5678"
                      value={transferHumanPhone}
                      onChange={(e) => setTransferHumanPhone(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    El número al que se transferirán las llamadas cuando el agente IA no pueda continuar
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Mensaje antes de transferir</Label>
                  <Textarea
                    value={transferHumanMessage}
                    onChange={(e) => setTransferHumanMessage(e.target.value)}
                    placeholder="Te transferiré con un asesor..."
                    rows={2}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condiciones para transferir</Label>
                  <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                    {transferConditions.map((condition) => (
                      <div
                        key={condition.id}
                        className="flex items-center gap-2 p-2 rounded border cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleTransferCondition(condition.id)}
                      >
                        <Switch
                          checked={transferConditionsSelected.includes(condition.id)}
                          onCheckedChange={() => toggleTransferCondition(condition.id)}
                        />
                        <span className="text-sm">{condition.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Transfer to Another Agent */}
          <div className="space-y-4 p-4 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Transferir a otro agente IA</p>
                  <p className="text-sm text-muted-foreground">Delegar a un agente especializado</p>
                </div>
              </div>
              <Switch checked={transferAgentEnabled} onCheckedChange={setTransferAgentEnabled} />
            </div>

            {transferAgentEnabled && (
              <div className="space-y-2 pt-2">
                <Label>Agente destino</Label>
                <Select value={transferAgentId} onValueChange={setTransferAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar agente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAgents.length === 0 ? (
                      <SelectItem value="none" disabled>No hay otros agentes</SelectItem>
                    ) : (
                      availableAgents.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Por ejemplo, transferir de ventas a soporte técnico
                </p>
              </div>
            )}
          </div>

          {/* Escalation Settings */}
          <div className="space-y-3 p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <Label className="mb-0">Escalamiento automático</Label>
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Escalar cuando el cliente está frustrado</span>
              <Switch checked={autoEscalateOnFrustration} onCheckedChange={setAutoEscalateOnFrustration} />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Escalar cuando el cliente pide un humano</span>
              <Switch checked={autoEscalateOnRequest} onCheckedChange={setAutoEscalateOnRequest} />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Working Hours */}
      <Collapsible open={hoursSectionOpen} onOpenChange={setHoursSectionOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-medium">Horario de atención</p>
              <p className="text-sm text-muted-foreground">
                {workingHoursEnabled 
                  ? `${workingHoursStart} - ${workingHoursEnd}` 
                  : "Disponible 24/7"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {workingHoursEnabled && (
              <Badge variant="secondary">Configurado</Badge>
            )}
            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${hoursSectionOpen ? "rotate-180" : ""}`} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 pt-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Limitar horario de atención</p>
              <p className="text-sm text-muted-foreground">
                Define horarios específicos para que el agente responda
              </p>
            </div>
            <Switch checked={workingHoursEnabled} onCheckedChange={setWorkingHoursEnabled} />
          </div>

          {workingHoursEnabled && (
            <div className="space-y-4 p-4 rounded-lg border">
              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Hora inicio</Label>
                  <Input
                    type="time"
                    value={workingHoursStart}
                    onChange={(e) => setWorkingHoursStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora fin</Label>
                  <Input
                    type="time"
                    value={workingHoursEnd}
                    onChange={(e) => setWorkingHoursEnd(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Días laborales</Label>
                <div className="flex flex-wrap gap-2">
                  {weekDays.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleWorkingDay(day.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        workingDays.includes(day.value)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mensaje fuera de horario</Label>
                <Textarea
                  value={afterHoursMessage}
                  onChange={(e) => setAfterHoursMessage(e.target.value)}
                  placeholder="Nuestro horario es..."
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      {/* Active Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
        <div>
          <p className="font-medium">{UI.common.status}</p>
          <p className="text-sm text-muted-foreground">
            {isActive ? "El agente responderá automáticamente" : "El agente está pausado"}
          </p>
        </div>
        <Switch checked={isActive} onCheckedChange={setIsActive} />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving} className="w-full sm:w-auto">
          {UI.common.cancel}
        </Button>
        <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            UI.common.save
          )}
        </Button>
      </div>
    </form>
  );
}
