"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import { ReactNode, useEffect } from "react";

interface ClerkProviderWrapperProps {
  children: ReactNode;
}

export function ClerkProviderWrapper({ children }: ClerkProviderWrapperProps) {
  // #region agent log
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'clerk-provider.tsx:15',message:'ClerkProviderWrapper mounted',data:{hasKey:!!key,keyPrefix:key?.substring(0,10),keyLength:key?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H1'})}).catch(()=>{});
  }, []);
  // #endregion

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

