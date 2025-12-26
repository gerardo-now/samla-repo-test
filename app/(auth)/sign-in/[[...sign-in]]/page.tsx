"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useEffect } from "react";

export default function SignInPage() {
  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'sign-in/page.tsx:10',message:'SignInPage mounted',data:{pathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
  }, []);
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
            Bienvenido de vuelta
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Accede a tu cuenta para continuar gestionando tus conversaciones y agentes.
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
            <div className="text-center mb-8 lg:hidden">
              <h1 className="text-2xl font-semibold mb-2">Iniciar sesión</h1>
              <p className="text-zinc-500 text-sm">
                Ingresa a tu cuenta de SAMLA
              </p>
            </div>

            <SignIn
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
              ¿No tienes cuenta?{" "}
              <Link href="/sign-up" className="text-zinc-900 hover:underline font-medium">
                Crear cuenta
              </Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
