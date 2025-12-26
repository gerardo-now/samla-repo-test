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
import { MessageSquare, Calendar, ClipboardList, Tag, Play, Volume2, Globe, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AgentEditorProps {
  agent?: {
    id: string;
    name: string;
    template: string;
    tone: string;
    language?: string;
    isActive: boolean;
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

  // Voices state
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

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
