import { NextRequest, NextResponse } from "next/server";
import { voiceProvider } from "@/lib/providers/voiceProvider";

/**
 * Voice Preview API
 * 
 * Generate a preview audio for a voice with sample text
 */

// POST /api/voices/preview - Generate voice preview
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { voiceId, text } = body;

    if (!voiceId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la voz" },
        { status: 400 }
      );
    }

    // Use sample text if not provided
    const previewText = text || "Hola, soy tu asistente virtual. ¿En qué puedo ayudarte hoy?";

    const result = await voiceProvider.generateSpeech({
      text: previewText,
      voiceId,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Error al generar la vista previa de la voz" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioBase64: result.audioBase64,
      durationSeconds: result.durationSeconds,
    });
  } catch (error) {
    console.error("Error generating voice preview:", error);
    return NextResponse.json(
      { error: "Error al generar la vista previa" },
      { status: 500 }
    );
  }
}

