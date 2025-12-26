"use client";

import { useState } from "react";
import { UI } from "@/lib/copy/uiStrings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Mic, Play, Pause, Upload, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Voice {
  id: string;
  name: string;
  language: string;
  tone?: string;
  isCustom: boolean;
  previewUrl?: string;
}

const mockVoices: Voice[] = [
  { id: "1", name: "Sofia", language: "es-MX", tone: "Amigable", isCustom: false },
  { id: "2", name: "Carlos", language: "es-MX", tone: "Profesional", isCustom: false },
  { id: "3", name: "María", language: "es-ES", tone: "Formal", isCustom: false },
  { id: "4", name: "Diego", language: "es-MX", tone: "Casual", isCustom: false },
];

export function VoicesSettings() {
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [consentChecked, setConsentChecked] = useState(false);

  const togglePlay = (voiceId: string) => {
    if (playingVoiceId === voiceId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(voiceId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Voice Library */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{UI.voice.library}</CardTitle>
              <CardDescription>
                Voces disponibles para tus agentes
              </CardDescription>
            </div>
            <Button onClick={() => setIsCloneDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {UI.voice.addCustom}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockVoices.map((voice) => (
              <div
                key={voice.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      voice.isCustom
                        ? "bg-purple-500/10 text-purple-600"
                        : "bg-primary/10 text-primary"
                    )}
                  >
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{voice.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {voice.language} {voice.tone && `· ${voice.tone}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {voice.isCustom && (
                    <Badge variant="secondary" className="text-xs">
                      Personalizada
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => togglePlay(voice.id)}
                  >
                    {playingVoiceId === voice.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Clone Voice Dialog */}
      <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{UI.voice.clone.title}</DialogTitle>
            <DialogDescription>
              Crea una voz personalizada a partir de una muestra de audio
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Upload Area */}
            <div className="space-y-2">
              <Label>{UI.voice.clone.upload}</Label>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arrastra un archivo de audio o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP3, WAV, M4A. Mínimo 30 segundos.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="voiceName">{UI.voice.fields.name}</Label>
              <Input id="voiceName" placeholder="Mi voz personalizada" />
            </div>

            {/* Consent Warning */}
            <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="space-y-3">
                  <p className="text-sm font-medium text-yellow-800">
                    Declaración de consentimiento requerida
                  </p>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="consent"
                      checked={consentChecked}
                      onCheckedChange={(checked) => setConsentChecked(checked === true)}
                    />
                    <Label
                      htmlFor="consent"
                      className="text-sm text-yellow-800 leading-relaxed cursor-pointer"
                    >
                      {UI.voice.clone.disclosure}
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsCloneDialogOpen(false)}>
                {UI.common.cancel}
              </Button>
              <Button disabled={!consentChecked}>{UI.common.create}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

