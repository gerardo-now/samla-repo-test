"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // Always wrap with ClerkProvider - it handles missing/invalid keys gracefully
  // This ensures all Clerk hooks (useSession, useUser, etc.) work without errors
  // If the key is missing or invalid, Clerk will show appropriate UI or remain in a loading state
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

