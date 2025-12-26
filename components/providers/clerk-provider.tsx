"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { ReactNode, useMemo } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Check if Clerk is properly configured
  const isClerkConfigured = useMemo(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    if (!key) return false;
    if (!key.startsWith("pk_")) return false;
    if (key.includes("placeholder") || key.includes("YOUR_")) return false;
    if (key.length < 50) return false;
    return true;
  }, []);

  // If Clerk is not configured, render children without provider
  if (!isClerkConfigured) {
    return <>{children}</>;
  }

  return (
    <ClerkProvider
      localization={esES}
      afterSignOutUrl="/"
      signInFallbackRedirectUrl="/home"
      signUpFallbackRedirectUrl="/home"
    >
      {children}
    </ClerkProvider>
  );
}

