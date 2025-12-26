"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Dynamically import UserButton to avoid loading Clerk when not configured
const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <FallbackUserAvatar />,
  }
);

interface HeaderProps {
  title?: string;
}

// Fallback user avatar when Clerk is not available
function FallbackUserAvatar() {
  return (
    <Avatar className="h-9 w-9 cursor-pointer">
      <AvatarFallback className="bg-primary/10">
        <User className="h-5 w-5 text-primary" />
      </AvatarFallback>
    </Avatar>
  );
}

export function Header({ title }: HeaderProps) {
  const [clerkAvailable, setClerkAvailable] = useState(false);

  useEffect(() => {
    // Check if Clerk is properly configured
    const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const isValid = key && key.startsWith("pk_") && key.length > 50;
    setClerkAvailable(!!isValid);
  }, []);

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </Button>
        {clerkAvailable ? (
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-9 w-9",
              },
            }}
          />
        ) : (
          <FallbackUserAvatar />
        )}
      </div>
    </header>
  );
}
