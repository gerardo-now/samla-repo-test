import { NextRequest, NextResponse } from "next/server";
import { leadProvider, type B2BSearchFilters } from "@/lib/providers/leadProvider";

/**
 * B2B Lead Search API
 * 
 * Uses Apollo.io internally for company/people search
 * Reference: https://docs.apollo.io/reference/people-api-search
 */

// POST /api/leads/search/b2b - Search B2B leads
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    const filters: B2BSearchFilters = {
      query: body.query,
      titles: body.titles,
      industries: body.industries,
      companySizes: body.companySizes,
      locations: body.locations,
      keywords: body.keywords,
      page: body.page || 1,
      perPage: body.perPage || 25,
    };

    // Validate at least one search criteria
    if (!filters.query && !filters.titles?.length && !filters.industries?.length && !filters.locations?.length) {
      return NextResponse.json(
        { error: "Se requiere al menos un criterio de búsqueda" },
        { status: 400 }
      );
    }

    const results = await leadProvider.searchB2B(filters);

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Error in B2B lead search:", error);
    return NextResponse.json(
      { error: "Error al buscar leads B2B" },
      { status: 500 }
    );
  }
}

