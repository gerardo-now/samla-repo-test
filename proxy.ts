import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";
import { appendFileSync } from "fs";

// #region agent log helper
function debugLog(location: string, message: string, data: Record<string, unknown>) {
  try {
    const logEntry = JSON.stringify({location,message,data,timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H4'}) + '\n';
    appendFileSync('/Users/gera/Desktop/samla-repo-test/.cursor/debug.log', logEntry);
  } catch {}
}
// #endregion

// Check if Clerk is properly configured
function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;
  
  // #region agent log
  debugLog('proxy.ts:22', 'isClerkConfigured check', {hasKey:!!key,hasSecret:!!secret,keyPrefix:key?.substring(0,10)});
  // #endregion
  
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

// Main proxy function - Next.js 16 uses proxy.ts instead of middleware.ts
export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  const pathname = request.nextUrl.pathname;
  const configured = isClerkConfigured();
  
  // #region agent log
  debugLog('proxy.ts:52', 'middleware handling request', {pathname,configured,isPublic:isPublicRoute(request)});
  // #endregion
  
  // If Clerk is not configured, skip authentication
  if (!configured) {
    // #region agent log
    debugLog('proxy.ts:58', 'Clerk not configured, skipping auth', {pathname});
    // #endregion
    return NextResponse.next();
  }
  
  // Use Clerk middleware
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
