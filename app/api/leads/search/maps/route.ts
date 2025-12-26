import { NextRequest, NextResponse } from "next/server";
import { leadProvider, type MapsSearchFilters } from "@/lib/providers/leadProvider";

/**
 * Google Maps Lead Search API
 * 
 * Uses Apify's compass/crawler-google-places Actor internally
 * Reference: https://apify.com/compass/crawler-google-places
 */

// POST /api/leads/search/maps - Search local businesses via Google Maps
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const { searchQuery, location, maxResults, language } = body;

    // Validate required fields
    if (!searchQuery || typeof searchQuery !== "string" || !searchQuery.trim()) {
      return NextResponse.json(
        { error: "Se requiere el tipo de negocio a buscar" },
        { status: 400 }
      );
    }

    if (!location || typeof location !== "string" || !location.trim()) {
      return NextResponse.json(
        { error: "Se requiere la ubicación" },
        { status: 400 }
      );
    }

    const filters: MapsSearchFilters = {
      searchQuery: searchQuery.trim(),
      location: location.trim(),
      maxResults: Math.min(maxResults || 50, 100), // Max 100 results
      language: language || "es",
    };

    const results = await leadProvider.searchMaps(filters);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Error in Maps lead search:", error);
    return NextResponse.json(
      { error: "Error al buscar negocios locales" },
      { status: 500 }
    );
  }
}

