"use client";

import { ClerkProvider as BaseClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { ReactNode } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

// Check if Clerk key is valid (not a placeholder)
function isValidClerkKey(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!key) return false;
  if (!key.startsWith("pk_")) return false;
  if (key.includes("placeholder")) return false;
  if (key.includes("YOUR_")) return false;
  if (key.length < 50) return false;
  return true;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // If no valid Clerk key, render children without Clerk
  if (!isValidClerkKey()) {
    return <>{children}</>;
  }

  return (
    <BaseClerkProvider localization={esES}>
      {children}
    </BaseClerkProvider>
  );
}

