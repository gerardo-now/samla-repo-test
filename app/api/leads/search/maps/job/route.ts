import { NextRequest, NextResponse } from "next/server";
import { leadProvider, type MapsSearchFilters } from "@/lib/providers/leadProvider";

/**
 * Async Maps Search Job API
 * 
 * For long-running searches, start a background job and poll for results
 * Uses Apify's compass/crawler-google-places Actor internally
 */

// POST /api/leads/search/maps/job - Start an async maps search job
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { searchQuery, location, maxResults, language } = body;

    // Validate required fields
    if (!searchQuery || !location) {
      return NextResponse.json(
        { error: "Se requiere el tipo de negocio y la ubicación" },
        { status: 400 }
      );
    }

    const filters: MapsSearchFilters = {
      searchQuery: searchQuery.trim(),
      location: location.trim(),
      maxResults: Math.min(maxResults || 50, 100),
      language: language || "es",
    };

    const { jobId } = await leadProvider.startMapsSearchJob(filters);

    return NextResponse.json({
      success: true,
      jobId,
      message: "Búsqueda iniciada. Usa el jobId para consultar el estado.",
    });
  } catch (error) {
    console.error("Error starting maps search job:", error);
    return NextResponse.json(
      { error: "Error al iniciar la búsqueda" },
      { status: 500 }
    );
  }
}

// GET /api/leads/search/maps/job?jobId=xxx - Get job status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get("jobId");

    if (!jobId) {
      return NextResponse.json(
        { error: "Se requiere el jobId" },
        { status: 400 }
      );
    }

    const job = await leadProvider.getMapsSearchJobStatus(jobId);

    // If completed, also fetch results
    let leads;
    if (job.status === "completed") {
      leads = await leadProvider.getMapsSearchJobResults(jobId);
    }

    return NextResponse.json({
      success: true,
      job,
      leads,
    });
  } catch (error) {
    console.error("Error getting maps search job:", error);
    return NextResponse.json(
      { error: "Error al obtener el estado del trabajo" },
      { status: 500 }
    );
  }
}

