import { NextResponse } from "next/server";
import { voiceProvider } from "@/lib/providers/voiceProvider";

/**
 * Voice Quota API
 * 
 * Get voice usage quota for the workspace
 */

// GET /api/voices/quota - Get voice usage quota
export async function GET() {
  try {
    const quota = await voiceProvider.getQuota();

    if (!quota) {
      return NextResponse.json({
        success: true,
        quota: {
          charactersUsed: 0,
          charactersLimit: 10000,
          voicesUsed: 0,
          voicesLimit: 10,
          resetsAt: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      quota: {
        charactersUsed: quota.charactersUsed,
        charactersLimit: quota.charactersLimit,
        charactersPercentage: Math.round((quota.charactersUsed / quota.charactersLimit) * 100),
        voicesUsed: quota.voicesUsed,
        voicesLimit: quota.voicesLimit,
        resetsAt: quota.resetsAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching quota:", error);
    return NextResponse.json(
      { error: "Error al obtener la cuota de uso" },
      { status: 500 }
    );
  }
}

