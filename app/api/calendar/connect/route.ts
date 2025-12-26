import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleCalendarProvider, OutlookCalendarProvider } from "@/lib/providers/calendarProvider";

export const dynamic = "force-dynamic";

/**
 * GET /api/calendar/connect?provider=google|outlook
 * Returns the OAuth authorization URL for the specified provider
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider");

    if (!provider || !["google", "outlook"].includes(provider)) {
      return NextResponse.json(
        { error: "Proveedor inválido. Usa 'google' o 'outlook'" },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const state = Buffer.from(JSON.stringify({ userId, provider })).toString("base64");

    let authUrl: string;

    if (provider === "google") {
      const config = {
        clientId: process.env.GOOGLE_CLIENT_ID || "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirectUri: `${appUrl}/api/calendar/callback`,
      };
      authUrl = GoogleCalendarProvider.getAuthUrl(config, state);
    } else {
      const config = {
        clientId: process.env.MICROSOFT_CLIENT_ID || "",
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
        redirectUri: `${appUrl}/api/calendar/callback`,
      };
      authUrl = OutlookCalendarProvider.getAuthUrl(config, state);
    }

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return NextResponse.json(
      { error: "Error al generar URL de autorización" },
      { status: 500 }
    );
  }
}

