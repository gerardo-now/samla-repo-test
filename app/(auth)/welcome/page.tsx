"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Mail,
  ArrowRight,
  Sparkles,
  Users,
  MessageSquare,
  Bot,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type FlowType = "create" | "invited" | null;

export default function WelcomePage() {
  const [selectedFlow, setSelectedFlow] = useState<FlowType>(null);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 border-b bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-xl">SAMLA</span>
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">
              Bienvenido a SAMLA
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Atiende clientes 24/7 con agentes de IA que responden WhatsApp, 
              llamadas y agendan citas automáticamente.
            </p>
          </div>

          {/* Features preview */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="text-center p-4 rounded-xl bg-muted/30 border">
              <MessageSquare className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-sm font-medium">WhatsApp</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30 border">
              <Bot className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Agentes IA</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30 border">
              <Calendar className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-sm font-medium">Citas</p>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <p className="text-center text-sm text-muted-foreground mb-6">
              ¿Cómo quieres comenzar?
            </p>

            <button
              onClick={() => setSelectedFlow("create")}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group",
                selectedFlow === "create"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg">Crear mi cuenta</p>
                <p className="text-sm text-muted-foreground">
                  Nuevo en SAMLA. Quiero registrarme y crear mi empresa.
                </p>
              </div>
              {selectedFlow === "create" && (
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              )}
            </button>

            <button
              onClick={() => setSelectedFlow("invited")}
              className={cn(
                "w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all text-left group",
                selectedFlow === "invited"
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40 hover:bg-muted/30"
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 group-hover:bg-purple-500/20 transition-colors">
                <Mail className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-lg">Recibí una invitación</p>
                <p className="text-sm text-muted-foreground">
                  Alguien me invitó a unirme a su equipo en SAMLA.
                </p>
              </div>
              {selectedFlow === "invited" && (
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />
              )}
            </button>
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col gap-3">
            {selectedFlow === "create" && (
              <Link href="/sign-up" className="w-full">
                <Button size="lg" className="w-full h-12 text-base">
                  Continuar
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}

            {selectedFlow === "invited" && (
              <Link href="/sign-up?invitation=true" className="w-full">
                <Button size="lg" className="w-full h-12 text-base">
                  Aceptar invitación
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            )}

            {!selectedFlow && (
              <Button size="lg" className="w-full h-12 text-base" disabled>
                Selecciona una opción
              </Button>
            )}

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/sign-in" className="text-primary hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} SAMLA. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

