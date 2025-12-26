"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Link from "next/link";

function SignUpContent() {
  const searchParams = useSearchParams();
  const invitationCode = searchParams.get("__clerk_ticket");
  const isInvitation = !!invitationCode || searchParams.get("invitation") === "true";

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sign-up/page.tsx:15',message:'SignUpContent mounted',data:{pathname:window.location.pathname,isInvitation,hasTicket:!!invitationCode},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  }, [isInvitation, invitationCode]);
  // #endregion

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-950 text-white flex-col justify-between p-12">
        <div>
          <Link href="/" className="text-2xl font-semibold tracking-tight">
            SAMLA
          </Link>
        </div>
        
        <div className="max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight leading-tight mb-6">
            {isInvitation 
              ? "Te han invitado a unirte a un equipo"
              : "Una bandeja. Cada conversación."
            }
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            {isInvitation
              ? "Crea tu cuenta para acceder al workspace de tu equipo."
              : "Conecta WhatsApp, crea agentes de voz y agenda citas. Todo desde una sola plataforma."
            }
          </p>
        </div>

        <p className="text-zinc-600 text-sm">
          © {new Date().getFullYear()} SAMLA
        </p>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden px-6 py-4 border-b">
          <Link href="/" className="text-xl font-semibold">
            SAMLA
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">
            {/* Invitation badge */}
            {isInvitation && (
              <div className="mb-6 text-center">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  Invitación de equipo
                </span>
              </div>
            )}

            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-2xl font-semibold mb-2">
                {isInvitation ? "Únete al equipo" : "Crea tu cuenta"}
              </h1>
              <p className="text-zinc-500 text-sm">
                {isInvitation 
                  ? "Ingresa tus datos para unirte" 
                  : "Comienza gratis, sin tarjeta de crédito"
                }
              </p>
            </div>

            <SignUp
              appearance={{
                elements: {
                  rootBox: "w-full",
                  card: "shadow-none p-0 bg-transparent",
                  headerTitle: "text-xl font-semibold text-zinc-900",
                  headerSubtitle: "text-zinc-500 text-sm",
                  socialButtonsBlockButton: "border border-zinc-200 hover:bg-zinc-50 text-zinc-700 font-medium",
                  socialButtonsBlockButtonText: "font-medium",
                  dividerLine: "bg-zinc-200",
                  dividerText: "text-zinc-400 text-sm",
                  formFieldLabel: "text-zinc-700 font-medium text-sm",
                  formFieldInput: "border-zinc-300 focus:border-zinc-900 focus:ring-zinc-900 rounded-lg",
                  formButtonPrimary: "bg-zinc-900 hover:bg-zinc-800 text-white font-medium rounded-lg h-11",
                  footerActionLink: "text-zinc-900 hover:text-zinc-700 font-medium",
                  identityPreviewEditButton: "text-zinc-600 hover:text-zinc-900",
                },
                layout: {
                  socialButtonsPlacement: "top",
                  showOptionalFields: false,
                },
              }}
            />

            <p className="mt-8 text-center text-sm text-zinc-500">
              ¿Ya tienes cuenta?{" "}
              <Link href="/sign-in" className="text-zinc-900 hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
