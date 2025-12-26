import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Phone,
  Bot,
  Calendar,
  Zap,
  ArrowRight,
  Check,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Mensajería unificada",
    description: "Todas tus conversaciones en un solo lugar",
  },
  {
    icon: Phone,
    title: "Llamadas con IA",
    description: "Agentes que hablan con voz humana",
  },
  {
    icon: Bot,
    title: "Agentes inteligentes",
    description: "Responden automáticamente 24/7",
  },
  {
    icon: Calendar,
    title: "Agenda automática",
    description: "Citas sin fricciones ni doble reserva",
  },
  {
    icon: Zap,
    title: "Automatizaciones",
    description: "Flujos que trabajan por ti",
  },
];

const benefits = [
  "Sin código, sin complejidad",
  "Listo para usar en minutos",
  "Voces realistas en español",
  "Soporte multicanal",
  "Precios transparentes",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
            SAMLA
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Empezar gratis</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6">
          Plataforma de Conversaciones con IA
        </Badge>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Una bandeja.
          <br />
          Cada conversación.
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Conecta WhatsApp y llamadas telefónicas, crea agentes con voz humana,
          agenda citas automáticamente. Todo sin código.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8">
              Comenzar ahora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/sign-in">
            <Button size="lg" variant="outline" className="text-lg px-8">
              Ver demo
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Todo lo que necesitas para conversar con tus clientes
          </h2>
          <p className="text-muted-foreground text-lg">
            Una plataforma completa que se configura en minutos
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border bg-card hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Diseñado para usuarios, no para desarrolladores
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Configura una vez y funciona. Sin integraciones complicadas, sin
              código, sin dolores de cabeza.
            </p>
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Check className="h-4 w-4 text-green-600" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Bot className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Vista previa de la plataforma</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Empieza a conversar con tus clientes hoy
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Regístrate gratis y configura tu primer agente en menos de 5 minutos.
            No necesitas tarjeta de crédito para empezar.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8">
              Crear cuenta gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-24">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-2xl font-bold text-primary tracking-tight">
              SAMLA
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 SAMLA. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
