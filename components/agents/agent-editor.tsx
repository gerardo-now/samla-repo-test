"use client";

import { useState } from "react";
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
import { MessageSquare, Calendar, ClipboardList, Tag, Play, Volume2 } from "lucide-react";

interface AgentEditorProps {
  agent?: {
    id: string;
    name: string;
    template: string;
    tone: string;
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

const tools = [
  { id: "sendWhatsapp", label: UI.agents.tools.sendWhatsapp, icon: MessageSquare },
  { id: "scheduleMeeting", label: UI.agents.tools.scheduleMeeting, icon: Calendar },
  { id: "createTask", label: UI.agents.tools.createTask, icon: ClipboardList },
  { id: "tagContact", label: UI.agents.tools.tagContact, icon: Tag },
];

const mockVoices = [
  { id: "voice-1", name: "Sofia", language: "es-MX", tone: "Amigable" },
  { id: "voice-2", name: "Carlos", language: "es-MX", tone: "Profesional" },
  { id: "voice-3", name: "María", language: "es-ES", tone: "Formal" },
];

export function AgentEditor({ agent, onSave, onCancel }: AgentEditorProps) {
  const [name, setName] = useState(agent?.name || "");
  const [template, setTemplate] = useState(agent?.template || "sales");
  const [tone, setTone] = useState(agent?.tone || "professional");
  const [voiceId, setVoiceId] = useState("");
  const [enabledTools, setEnabledTools] = useState<string[]>(["sendWhatsapp", "scheduleMeeting"]);
  const [goals, setGoals] = useState("");
  const [isActive, setIsActive] = useState(agent?.isActive ?? true);

  const toggleTool = (toolId: string) => {
    setEnabledTools((prev) =>
      prev.includes(toolId) ? prev.filter((t) => t !== toolId) : [...prev, toolId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save agent
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">{UI.agents.fields.name}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Mi agente de ventas"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="template">{UI.agents.fields.template}</Label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tone">{UI.agents.fields.tone}</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
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
              <Select value={voiceId} onValueChange={setVoiceId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar voz" />
                </SelectTrigger>
                <SelectContent>
                  {mockVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} ({voice.language})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="icon" disabled={!voiceId}>
                <Play className="h-4 w-4" />
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
        />
      </div>

      <Separator />

      {/* Tools */}
      <div className="space-y-4">
        <Label>{UI.agents.fields.tools}</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50"
              onClick={() => toggleTool(tool.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
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
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {UI.common.cancel}
        </Button>
        <Button type="submit">{UI.common.save}</Button>
      </div>
    </form>
  );
}

