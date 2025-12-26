import { NextRequest, NextResponse } from "next/server";
import { voiceProvider } from "@/lib/providers/voiceProvider";

/**
 * Voices API
 * 
 * Get available voices and manage voice settings
 * Uses voice provider internally (ElevenLabs) - provider name never exposed
 */

// GET /api/voices - Get all available voices
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const language = searchParams.get("language");

    let voices;
    if (language) {
      voices = await voiceProvider.getVoicesByLanguage(language);
    } else {
      voices = await voiceProvider.getAvailableVoices();
    }

    return NextResponse.json({
      success: true,
      voices,
      total: voices.length,
    });
  } catch (error) {
    console.error("Error fetching voices:", error);
    return NextResponse.json(
      { error: "Error al obtener las voces disponibles" },
      { status: 500 }
    );
  }
}

