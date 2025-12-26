import { NextResponse } from "next/server";
import { GoogleCalendarProvider, OutlookCalendarProvider } from "@/lib/providers/calendarProvider";

export const dynamic = "force-dynamic";

/**
 * GET /api/calendar/callback
 * OAuth callback handler for calendar connections
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    if (error) {
      console.error("OAuth error:", error);
      return NextResponse.redirect(`${appUrl}/settings?error=calendar_denied`);
    }

    if (!code || !state) {
      return NextResponse.redirect(`${appUrl}/settings?error=invalid_callback`);
    }

    // Decode state
    let stateData: { userId: string; provider: string };
    try {
      stateData = JSON.parse(Buffer.from(state, "base64").toString());
    } catch {
      return NextResponse.redirect(`${appUrl}/settings?error=invalid_state`);
    }

    const { userId, provider } = stateData;

    // Exchange code for tokens
    let credentials;
    let email: string | null = null;

    if (provider === "google") {
      const config = {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirectUri: `${appUrl}/api/calendar/callback`,
      };
      
      credentials = await GoogleCalendarProvider.exchangeCode(code, config);
      
      if (credentials) {
        const googleProvider = new GoogleCalendarProvider(credentials, config);
        email = await googleProvider.getUserEmail();
      }
    } else if (provider === "outlook") {
      const config = {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
        redirectUri: `${appUrl}/api/calendar/callback`,
      };
      
      credentials = await OutlookCalendarProvider.exchangeCode(code, config);
      
      if (credentials) {
        const outlookProvider = new OutlookCalendarProvider(credentials, config);
        email = await outlookProvider.getUserEmail();
      }
    }

    if (!credentials) {
      return NextResponse.redirect(`${appUrl}/settings?error=token_exchange_failed`);
    }

    // In production, save to database:
    // await prisma.calendarConnection.upsert({
    //   where: {
    //     userId_provider_externalEmail: {
    //       userId,
    //       provider: provider.toUpperCase(),
    //       externalEmail: email || '',
    //     },
    //   },
    //   update: {
    //     accessToken: credentials.accessToken,
    //     refreshToken: credentials.refreshToken,
    //     tokenExpiresAt: credentials.tokenExpiresAt,
    //     lastSyncAt: new Date(),
    //   },
    //   create: {
    //     workspaceId: 'current-workspace-id',
    //     userId,
    //     provider: provider.toUpperCase(),
    //     externalEmail: email || '',
    //     accessToken: credentials.accessToken,
    //     refreshToken: credentials.refreshToken,
    //     tokenExpiresAt: credentials.tokenExpiresAt,
    //   },
    // });

    console.log("Calendar connected:", { userId, provider, email });

    // Redirect to settings with success
    return NextResponse.redirect(`${appUrl}/settings?tab=calendario&success=calendar_connected`);
  } catch (error) {
    console.error("Callback error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/settings?error=callback_failed`);
  }
}

