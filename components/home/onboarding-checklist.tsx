"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Phone,
  Calendar,
  Bot,
  Mic,
  BookOpen,
  Radio,
  CreditCard,
  Check,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  whyItMatters: string;
  icon: React.ElementType;
  href: string;
  completed: boolean;
}

const checklistItems: ChecklistItem[] = [
  {
    id: "whatsapp",
    label: "Conecta mensajería",
    description: "Vincula tu WhatsApp Business",
    whyItMatters: "Para recibir mensajes de clientes directamente en SAMLA y que tus agentes puedan responder automáticamente.",
    icon: MessageSquare,
    href: "/settings#channels",
    completed: false,
  },
  {
    id: "phone",
    label: "Conecta llamadas",
    description: "Activa las llamadas telefónicas",
    whyItMatters: "Para que tus agentes de IA puedan recibir y realizar llamadas con voz humana.",
    icon: Phone,
    href: "/settings#channels",
    completed: false,
  },
  {
    id: "calendar",
    label: "Conecta calendario",
    description: "Vincula Google o Outlook",
    whyItMatters: "Para que tus agentes vean tu disponibilidad real y agenden citas automáticamente sin doble reserva.",
    icon: Calendar,
    href: "/settings?tab=calendar",
    completed: false,
  },
  {
    id: "agent",
    label: "Crea un agente",
    description: "Tu primer asistente de IA",
    whyItMatters: "Los agentes responden automáticamente a tus clientes 24/7. Puedes crear uno para ventas, soporte, o cobranza.",
    icon: Bot,
    href: "/agents",
    completed: false,
  },
  {
    id: "voice",
    label: "Elige una voz",
    description: "La voz de tu agente",
    whyItMatters: "Tus clientes escucharán esta voz cuando hablen con tu agente por teléfono. Elige una que represente a tu marca.",
    icon: Mic,
    href: "/settings?tab=voices",
    completed: false,
  },
  {
    id: "knowledge",
    label: "Agrega material",
    description: "Información para tu agente",
    whyItMatters: "Sube PDFs, links, o preguntas frecuentes para que tu agente responda con información precisa de tu negocio.",
    icon: BookOpen,
    href: "/knowledge",
    completed: false,
  },
  {
    id: "liveMode",
    label: "Activa modo en vivo",
    description: "Enciende tu agente",
    whyItMatters: "Cuando está activado, tu agente empieza a responder automáticamente. Puedes apagarlo cuando quieras.",
    icon: Radio,
    href: "/home",
    completed: false,
  },
  {
    id: "billing",
    label: "Configura tu plan",
    description: "Elige tu suscripción",
    whyItMatters: "Selecciona el plan que se ajuste a tus necesidades. Puedes empezar gratis y escalar cuando crezcas.",
    icon: CreditCard,
    href: "/settings?tab=billing",
    completed: false,
  },
];

export function OnboardingChecklist() {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const completedCount = checklistItems.filter((item) => item.completed).length;
  const progress = (completedCount / checklistItems.length) * 100;
  const isComplete = completedCount === checklistItems.length;

  if (isComplete) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Configura tu espacio
            </CardTitle>
            <CardDescription className="mt-1">
              Completa estos pasos para empezar ({completedCount}/{checklistItems.length})
            </CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground hover:text-foreground transition-colors">
                  <HelpCircle className="h-5 w-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-xs">
                <p className="text-sm">
                  Sigue estos pasos en orden para configurar tu espacio de trabajo. 
                  Cada paso te acerca a tener tu agente de IA funcionando.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Progress value={progress} className="h-2 mt-3" />
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={300}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {checklistItems.map((item, index) => (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "group flex flex-col p-4 rounded-xl border transition-all relative",
                      item.completed
                        ? "bg-muted/50 border-muted"
                        : "bg-background border-border hover:border-primary hover:shadow-md"
                    )}
                  >
                    {/* Step number badge */}
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                      {item.completed ? <Check className="h-3 w-3" /> : index + 1}
                    </div>

                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-lg shrink-0 transition-colors",
                          item.completed
                            ? "bg-green-500/10 text-green-600"
                            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                        )}
                      >
                        {item.completed ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          <item.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            item.completed && "text-muted-foreground line-through"
                          )}
                        >
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    {!item.completed && (
                      <div className="flex items-center justify-end mt-3 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        Configurar
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </div>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="font-medium mb-1">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.whyItMatters}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Helpful tip */}
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-dashed">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Tip:</strong> Empieza conectando tu WhatsApp y calendario. 
            Después crea tu primer agente. ¡En 10 minutos estarás listo!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
