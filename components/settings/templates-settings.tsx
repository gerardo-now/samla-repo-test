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
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileText, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  isDefault: boolean;
}

const mockTemplates: MessageTemplate[] = [
  {
    id: "1",
    name: "Te mando info",
    category: "info",
    content: "Hola {{name}}, te comparto la información que solicitaste...",
    variables: ["name"],
    isDefault: true,
  },
  {
    id: "2",
    name: "Confirmación de cita",
    category: "appointment",
    content: "Hola {{name}}, tu cita ha sido confirmada para el {{date}} a las {{time}}.",
    variables: ["name", "date", "time"],
    isDefault: true,
  },
  {
    id: "3",
    name: "Recordatorio de cita",
    category: "appointment",
    content: "Hola {{name}}, te recordamos tu cita mañana {{date}} a las {{time}}. ¡Te esperamos!",
    variables: ["name", "date", "time"],
    isDefault: true,
  },
  {
    id: "4",
    name: "Seguimiento",
    category: "followup",
    content: "Hola {{name}}, ¿pudiste revisar la información que te enviamos? Quedamos pendientes.",
    variables: ["name"],
    isDefault: true,
  },
  {
    id: "5",
    name: "Cierre",
    category: "closing",
    content: "Hola {{name}}, ¿te gustaría agendar una llamada para resolver tus dudas?",
    variables: ["name"],
    isDefault: true,
  },
];

export function TemplatesSettings() {
  const [isAddTemplateOpen, setIsAddTemplateOpen] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Plantillas de mensaje</CardTitle>
              <CardDescription>
                Mensajes predefinidos que puedes usar en conversaciones y campañas
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddTemplateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva plantilla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTemplates.map((template) => (
              <div
                key={template.id}
                className="flex items-start justify-between p-4 rounded-lg border hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{template.name}</p>
                      {template.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Predeterminada
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.content}
                    </p>
                    {template.variables.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs font-mono">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>{UI.common.edit}</DropdownMenuItem>
                    <DropdownMenuItem>Duplicar</DropdownMenuItem>
                    {!template.isDefault && (
                      <DropdownMenuItem className="text-destructive">
                        {UI.common.delete}
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Template Dialog */}
      <Dialog open={isAddTemplateOpen} onOpenChange={setIsAddTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva plantilla</DialogTitle>
            <DialogDescription>
              Crea una plantilla de mensaje reutilizable
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">{UI.common.name}</Label>
              <Input id="templateName" placeholder="Nombre de la plantilla" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateContent">Contenido</Label>
              <Textarea
                id="templateContent"
                placeholder="Escribe el mensaje. Usa {{name}}, {{date}}, {{time}} para variables."
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Variables disponibles: {`{{name}}`}, {`{{date}}`}, {`{{time}}`}
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddTemplateOpen(false)}>
                {UI.common.cancel}
              </Button>
              <Button>{UI.common.save}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

