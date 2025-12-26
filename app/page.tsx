import Link from "next/link";
import { Button } from "@/components/ui/button";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/20">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold tracking-tight">
            SAMLA
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <Link href="#features" className="hover:text-white transition-colors">Producto</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Precios</Link>
            <Link href="#about" className="hover:text-white transition-colors">Nosotros</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Iniciar sesión
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-white text-black hover:bg-white/90 font-medium">
                Comenzar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-white/40 mb-8 font-medium">
            Plataforma de conversaciones
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[0.95] mb-8">
            Una bandeja.
            <br />
            <span className="text-white/50">Cada conversación.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed">
            Conecta WhatsApp y llamadas, crea agentes de voz, agenda citas
            automáticamente. Todo desde una sola plataforma.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 font-medium h-12 px-8 text-base">
                Comenzar gratis
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white h-12 px-8 text-base">
                Ver demostración
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-sm uppercase tracking-[0.2em] text-white/40 mb-4 font-medium">
              Capacidades
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight">
              Todo en un solo lugar
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {[
              {
                title: "Bandeja unificada",
                desc: "WhatsApp, llamadas y mensajes en un solo lugar. Sin cambiar entre aplicaciones.",
              },
              {
                title: "Agentes de voz",
                desc: "Voces naturales que atienden llamadas y responden mensajes automáticamente.",
              },
              {
                title: "Agenda inteligente",
                desc: "Citas sin fricciones. Sin doble reserva. Integrado con tu calendario.",
              },
              {
                title: "Base de conocimiento",
                desc: "Alimenta a tus agentes con información de tu negocio para respuestas precisas.",
              },
              {
                title: "CRM integrado",
                desc: "Gestiona contactos, historial de conversaciones y seguimiento de prospectos.",
              },
              {
                title: "Automatizaciones",
                desc: "Flujos que trabajan por ti. Respuestas automáticas basadas en eventos.",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="bg-[#0a0a0a] p-8 md:p-10 hover:bg-white/[0.02] transition-colors"
              >
                <h3 className="text-lg font-medium mb-3">{feature.title}</h3>
                <p className="text-white/40 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8 text-center">
            {[
              { value: "24/7", label: "Disponibilidad" },
              { value: "<5 min", label: "Tiempo de configuración" },
              { value: "99.9%", label: "Uptime garantizado" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight mb-2">
                  {stat.value}
                </p>
                <p className="text-white/40 text-sm uppercase tracking-[0.15em]">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.2em] text-white/40 mb-4 font-medium">
              Cómo funciona
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
              Configura una vez, funciona siempre
            </h2>
            <p className="text-white/50 text-lg leading-relaxed">
              Sin código. Sin integraciones complicadas. Conecta tus canales,
              crea tu agente y deja que SAMLA se encargue del resto.
            </p>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Conecta tus canales",
                desc: "Vincula tu WhatsApp Business y configura tus números de teléfono en minutos.",
              },
              {
                step: "02",
                title: "Crea tu agente",
                desc: "Define la personalidad, voz y conocimiento de tu agente de IA.",
              },
              {
                step: "03",
                title: "Activa y listo",
                desc: "Enciende el modo en vivo y tu agente comienza a atender automáticamente.",
              },
            ].map((item, i) => (
              <div key={i} className="relative">
                <span className="text-5xl font-semibold text-white/5 absolute -top-2 -left-1">
                  {item.step}
                </span>
                <div className="relative pt-10">
                  <h3 className="text-lg font-medium mb-3">{item.title}</h3>
                  <p className="text-white/40 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight mb-6">
            Empieza a conversar hoy
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Crea tu cuenta gratis y configura tu primer agente en menos de 5 minutos.
            No necesitas tarjeta de crédito.
          </p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-black hover:bg-white/90 font-medium h-12 px-10 text-base">
              Crear cuenta gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xl font-semibold tracking-tight">SAMLA</div>
            <div className="flex items-center gap-8 text-sm text-white/40">
              <Link href="#" className="hover:text-white transition-colors">Términos</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacidad</Link>
              <Link href="#" className="hover:text-white transition-colors">Contacto</Link>
            </div>
            <p className="text-sm text-white/30">
              © 2025 SAMLA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
