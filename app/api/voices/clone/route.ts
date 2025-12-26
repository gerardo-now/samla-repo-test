import { NextRequest, NextResponse } from "next/server";
import { voiceProvider } from "@/lib/providers/voiceProvider";

/**
 * Voice Cloning API
 * 
 * Clone a voice from audio samples
 * Requires explicit consent confirmation
 */

// POST /api/voices/clone - Clone a new voice
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const workspaceId = formData.get("workspaceId") as string;
    const consentConfirmed = formData.get("consentConfirmed") === "true";
    const description = formData.get("description") as string | null;
    
    // Get audio files
    const audioFiles: Blob[] = [];
    const files = formData.getAll("audioFiles");
    for (const file of files) {
      if (file instanceof Blob) {
        audioFiles.push(file);
      }
    }

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Se requiere el nombre de la voz" },
        { status: 400 }
      );
    }

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Se requiere el ID del workspace" },
        { status: 400 }
      );
    }

    if (!consentConfirmed) {
      return NextResponse.json(
        { 
          error: "Se requiere confirmar el consentimiento para clonar una voz",
          code: "CONSENT_REQUIRED"
        },
        { status: 400 }
      );
    }

    if (audioFiles.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un archivo de audio" },
        { status: 400 }
      );
    }

    // Clone the voice
    const result = await voiceProvider.cloneVoice({
      name: name.trim(),
      audioFiles,
      workspaceId,
      consentConfirmed,
      description: description || undefined,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Error al clonar la voz. Verifica que los archivos de audio sean válidos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      voice: {
        id: result.voiceId,
        name: result.name,
        previewUrl: result.previewUrl,
        isCustom: true,
      },
      message: "Voz clonada exitosamente",
    });
  } catch (error) {
    console.error("Error cloning voice:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud de clonación" },
      { status: 500 }
    );
  }
}

// DELETE /api/voices/clone?voiceId=xxx - Delete a cloned voice
export async function DELETE(req: NextRequest) {
  try {
    const voiceId = req.nextUrl.searchParams.get("voiceId");

    if (!voiceId) {
      return NextResponse.json(
        { error: "Se requiere el ID de la voz" },
        { status: 400 }
      );
    }

    const success = await voiceProvider.deleteVoice(voiceId);

    if (!success) {
      return NextResponse.json(
        { error: "Error al eliminar la voz" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Voz eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error deleting voice:", error);
    return NextResponse.json(
      { error: "Error al eliminar la voz" },
      { status: 500 }
    );
  }
}

