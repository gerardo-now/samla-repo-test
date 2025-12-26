"use client";

import { SignUp } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Sparkles, Users } from "lucide-react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const isInvitation = searchParams.get("invitation") === "true";
  const redirectUrl = searchParams.get("redirect_url");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <Link href="/welcome" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-xl">SAMLA</span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        {isInvitation && (
          <div className="mb-6 flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-700">
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Uniéndote a un equipo existente</span>
          </div>
        )}
        
        <SignUp
          redirectUrl={redirectUrl || "/home"}
          appearance={{
            elements: {
              formButtonPrimary: "bg-primary hover:bg-primary/90",
              card: "shadow-lg border",
              headerTitle: "text-2xl font-bold",
              headerSubtitle: "text-muted-foreground",
              socialButtonsBlockButton: "border border-border hover:bg-muted/50",
              formFieldInput: "border-border focus:ring-primary",
              footerActionLink: "text-primary hover:text-primary/80",
            },
          }}
        />

        <p className="mt-6 text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/sign-in" className="text-primary hover:underline font-medium">
            Iniciar sesión
          </Link>
        </p>
      </main>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      <SignUpContent />
    </Suspense>
  );
}
