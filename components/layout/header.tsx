"use client";

import { useEffect, useState, useMemo } from "react";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  title?: string;
}

function FallbackAvatar() {
  return (
    <Avatar className="h-9 w-9 cursor-pointer">
      <AvatarFallback className="bg-primary/10">
        <User className="h-5 w-5 text-primary" />
      </AvatarFallback>
    </Avatar>
  );
}

// Dynamic import of Clerk components
function ClerkUserSection() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [ClerkModule, setClerkModule] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    import("@clerk/nextjs").then((mod) => {
      if (mounted) {
        setClerkModule(mod);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ClerkModule) {
    return <FallbackAvatar />;
  }

  const { SignedIn, SignedOut, UserButton, SignInButton } = ClerkModule;

  return (
    <>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: "h-9 w-9",
            },
          }}
        />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <FallbackAvatar />
        </SignInButton>
      </SignedOut>
    </>
  );
}

export function Header({ title }: HeaderProps) {
  // Check if Clerk is available - computed once on mount
  const clerkAvailable = useMemo(() => {
    if (typeof window === "undefined") return false;
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    return !!(key && key.startsWith("pk_") && !key.includes("placeholder") && key.length > 50);
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4 ml-12 md:ml-0">
        {title && <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>}
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="relative h-9 w-9 md:h-10 md:w-10">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
        
        {clerkAvailable ? <ClerkUserSection /> : <FallbackAvatar />}
      </div>
    </header>
  );
}
