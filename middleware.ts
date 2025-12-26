import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  if (!key.startsWith('pk_')) return false;
  // Detect placeholder keys
  if (key.includes('placeholder') || key.includes('xxx') || key.length < 50) return false;
  return true;
}

// Only import and use Clerk middleware if we have a valid key
const hasValidClerkKey = isValidClerkKey(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

async function middleware(request: NextRequest) {
  // If no valid Clerk key, allow all requests (dev mode without auth)
  if (!hasValidClerkKey) {
    return NextResponse.next();
  }

  // Dynamically import Clerk middleware only when we have a valid key
  const { clerkMiddleware, createRouteMatcher } = await import("@clerk/nextjs/server");
  
  const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/api/webhooks/(.*)",
  ]);

  return clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
      await auth.protect();
    }
  })(request, {} as any);
}

export default middleware;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
