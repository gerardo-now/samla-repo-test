"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser, useSignIn, useSignUp, SignIn, SignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Mail,
  Building2,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

function AcceptInvitationContent() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [invitationCode, setInvitationCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<{
    workspaceName: string;
    inviterName: string;
    email: string;
  } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // Check for invitation token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setInvitationCode(token);
      validateInvitation(token);
    }
  }, [searchParams]);

  const validateInvitation = async (code: string) => {
    setIsValidating(true);
    try {
      const response = await fetch(`/api/workspace/invitation/validate?code=${code}`);
      if (response.ok) {
        const data = await response.json();
        setInvitationDetails(data);
      } else {
        toast.error("Invitación inválida o expirada");
      }
    } catch (error) {
      console.error("Error validating invitation:", error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAcceptInvitation = async () => {
    if (!isSignedIn || !invitationCode) return;

    setIsValidating(true);
    try {
      const response = await fetch("/api/workspace/invitation/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: invitationCode }),
      });

      if (response.ok) {
        toast.success("¡Te has unido al equipo!");
        router.push("/home");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al aceptar invitación");
      }
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Error al aceptar invitación");
    } finally {
      setIsValidating(false);
    }
  };

  const handleContinue = () => {
    if (invitationCode) {
      validateInvitation(invitationCode);
    }
  };

  // If user is signed in and has valid invitation, show accept button
  if (isLoaded && isSignedIn && invitationDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Te invitaron a unirte</CardTitle>
            <CardDescription>
              {invitationDetails.inviterName} te invitó a unirte a{" "}
              <strong>{invitationDetails.workspaceName}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{invitationDetails.workspaceName}</p>
                  <p className="text-sm text-muted-foreground">Equipo en SAMLA</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAcceptInvitation}
              disabled={isValidating}
              className="w-full"
              size="lg"
            >
              {isValidating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Aceptar invitación
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Te unirás como <strong>{user?.emailAddresses[0]?.emailAddress}</strong>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If invitation is validated but user needs to sign up/in
  if (invitationDetails && !isSignedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Únete a {invitationDetails.workspaceName}</h1>
            <p className="text-muted-foreground">
              {invitationDetails.inviterName} te invitó a colaborar
            </p>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 text-center">
            <Mail className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm">
              Invitación para: <strong>{invitationDetails.email}</strong>
            </p>
          </div>

          {showAuth ? (
            <div className="flex justify-center">
              <SignUp
                redirectUrl={`/accept-invitation?token=${invitationCode}`}
                appearance={{
                  elements: {
                    formButtonPrimary: "bg-primary hover:bg-primary/90",
                    card: "shadow-none border-0",
                  },
                }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                onClick={() => setShowAuth(true)}
                className="w-full"
                size="lg"
              >
                Crear cuenta y unirme
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link 
                  href={`/sign-in?redirect_url=/accept-invitation?token=${invitationCode}`}
                  className="text-primary hover:underline font-medium"
                >
                  Iniciar sesión
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Initial state - enter invitation code
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-background to-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">¿Recibiste una invitación?</CardTitle>
          <CardDescription>
            Ingresa el código de invitación que recibiste por correo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código de invitación</Label>
            <Input
              id="code"
              placeholder="Ej: INV-XXXX-XXXX"
              value={invitationCode}
              onChange={(e) => setInvitationCode(e.target.value)}
              className="text-center text-lg tracking-wider"
            />
          </div>

          <Button
            onClick={handleContinue}
            disabled={!invitationCode.trim() || isValidating}
            className="w-full"
            size="lg"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <>
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">o</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes invitación?{" "}
            <Link href="/welcome" className="text-primary hover:underline font-medium">
              Crear mi cuenta
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <AcceptInvitationContent />
    </Suspense>
  );
}

