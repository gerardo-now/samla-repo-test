import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Check if Clerk is properly configured
function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;
  
  if (!key || !secret) return false;
  if (!key.startsWith("pk_")) return false;
  if (key.includes("placeholder") || key.includes("YOUR_")) return false;
  if (key.length < 50) return false;
  
  return true;
}

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/welcome",
  "/accept-invitation(.*)",
  "/api/webhooks/(.*)",
  "/api/health",
]);

// Create the Clerk middleware handler
const clerkHandler = clerkMiddleware(async (auth, request) => {
  // If not a public route, protect it
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

// Main middleware function
export default function middleware(request: NextRequest) {
  // If Clerk is not configured, skip authentication
  if (!isClerkConfigured()) {
    return NextResponse.next();
  }
  
  // Use Clerk middleware
  return clerkHandler(request, {} as never);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
