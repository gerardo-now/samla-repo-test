/**
 * Lead Provider Abstraction
 *
 * INTERNAL ONLY - Provider names must NEVER appear in UI
 * Integrates:
 * - Apollo.io for B2B lead search (https://docs.apollo.io)
 * - Apify for Google Maps scraping (compass/crawler-google-places)
 */

// ============================================================================
// TYPES
// ============================================================================

export interface B2BSearchFilters {
  query?: string;
  titles?: string[];
  industries?: string[];
  companySizes?: string[]; // e.g., "1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"
  locations?: string[];
  keywords?: string[];
  page?: number;
  perPage?: number;
}

export interface MapsSearchFilters {
  searchQuery: string;
  location: string;
  maxResults?: number;
  language?: string;
}

export interface B2BLead {
  id: string;
  firstName?: string;
  lastName?: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  company: {
    id: string;
    name: string;
    domain?: string;
    industry?: string;
    size?: string;
    location?: string;
    linkedinUrl?: string;
  };
}

export interface MapsLead {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  placeUrl?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface SearchResult<T> {
  leads: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// ============================================================================
// APOLLO.IO B2B SEARCH
// Based on: https://docs.apollo.io/reference/people-api-search
// ============================================================================

const APOLLO_API_BASE = "https://api.apollo.io/v1";

interface ApolloPersonSearchResponse {
  people: Array<{
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    title: string;
    email: string;
    phone_numbers?: Array<{ raw_number: string }>;
    linkedin_url: string;
    organization: {
      id: string;
      name: string;
      website_url: string;
      industry: string;
      estimated_num_employees: number;
      city: string;
      state: string;
      country: string;
      linkedin_url: string;
    };
  }>;
  pagination: {
    page: number;
    per_page: number;
    total_entries: number;
    total_pages: number;
  };
}

async function searchApolloB2B(filters: B2BSearchFilters): Promise<SearchResult<B2BLead>> {
  const apiKey = process.env.APOLLO_API_KEY;

  if (!apiKey) {
    console.warn("APOLLO_API_KEY not configured, returning mock data");
    return getMockB2BResults(filters);
  }

  try {
    // Build Apollo API request body
    // Reference: https://docs.apollo.io/reference/people-api-search
    const requestBody: Record<string, unknown> = {
      page: filters.page || 1,
      per_page: filters.perPage || 25,
    };

    // Add person titles filter
    if (filters.titles && filters.titles.length > 0) {
      requestBody.person_titles = filters.titles;
    }

    // Add industry filter
    if (filters.industries && filters.industries.length > 0) {
      requestBody.organization_industry_tag_ids = filters.industries;
    }

    // Add location filter
    if (filters.locations && filters.locations.length > 0) {
      requestBody.person_locations = filters.locations;
    }

    // Add company size filter
    if (filters.companySizes && filters.companySizes.length > 0) {
      requestBody.organization_num_employees_ranges = filters.companySizes;
    }

    // Add keyword/query filter
    if (filters.query) {
      requestBody.q_keywords = filters.query;
    }

    const response = await fetch(`${APOLLO_API_BASE}/mixed_people/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache",
        "X-Api-Key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Apollo API error:", response.status, error);
      throw new Error(`Apollo API error: ${response.status}`);
    }

    const data: ApolloPersonSearchResponse = await response.json();

    const leads: B2BLead[] = data.people.map((person) => ({
      id: person.id,
      firstName: person.first_name,
      lastName: person.last_name,
      name: person.name,
      title: person.title,
      email: person.email,
      phone: person.phone_numbers?.[0]?.raw_number,
      linkedinUrl: person.linkedin_url,
      company: {
        id: person.organization?.id || "",
        name: person.organization?.name || "",
        domain: person.organization?.website_url,
        industry: person.organization?.industry,
        size: getCompanySizeLabel(person.organization?.estimated_num_employees),
        location: [
          person.organization?.city,
          person.organization?.state,
          person.organization?.country,
        ]
          .filter(Boolean)
          .join(", "),
        linkedinUrl: person.organization?.linkedin_url,
      },
    }));

    return {
      leads,
      total: data.pagination.total_entries,
      page: data.pagination.page,
      perPage: data.pagination.per_page,
      hasMore: data.pagination.page < data.pagination.total_pages,
    };
  } catch (error) {
    console.error("Error searching Apollo:", error);
    return getMockB2BResults(filters);
  }
}

function getCompanySizeLabel(employees?: number): string {
  if (!employees) return "Desconocido";
  if (employees <= 10) return "1-10";
  if (employees <= 50) return "11-50";
  if (employees <= 200) return "51-200";
  if (employees <= 500) return "201-500";
  if (employees <= 1000) return "501-1000";
  return "1000+";
}

// ============================================================================
// APIFY GOOGLE MAPS SCRAPER
// Based on: compass/crawler-google-places Actor
// ============================================================================

const APIFY_API_BASE = "https://api.apify.com/v2";

interface ApifyRunResponse {
  data: {
    id: string;
    status: string;
    defaultDatasetId: string;
  };
}

interface ApifyPlaceResult {
  title: string;
  address: string;
  phone: string;
  website: string;
  totalScore: number;
  reviewsCount: number;
  categoryName: string;
  url: string;
  location: {
    lat: number;
    lng: number;
  };
  placeId: string;
}

async function searchGoogleMaps(filters: MapsSearchFilters): Promise<SearchResult<MapsLead>> {
  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken) {
    console.warn("APIFY_API_TOKEN not configured, returning mock data");
    return getMockMapsResults(filters);
  }

  try {
    // Prepare the Actor input for compass/crawler-google-places
    // Reference: https://apify.com/compass/crawler-google-places
    const actorInput = {
      searchStringsArray: [filters.searchQuery],
      locationQuery: filters.location,
      maxCrawledPlacesPerSearch: filters.maxResults || 50,
      language: filters.language || "es",
      // Disable social media scraping for faster results
      scrapeSocialMediaProfiles: {
        facebooks: false,
        instagrams: false,
        youtubes: false,
        tiktoks: false,
        twitters: false,
      },
      maximumLeadsEnrichmentRecords: 0,
      maxImages: 0,
    };

    // Start the actor run
    const runResponse = await fetch(
      `${APIFY_API_BASE}/acts/compass~crawler-google-places/runs?token=${apiToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(actorInput),
      }
    );

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error("Apify run error:", runResponse.status, error);
      throw new Error(`Apify run error: ${runResponse.status}`);
    }

    const runData: ApifyRunResponse = await runResponse.json();
    const runId = runData.data.id;

    // Wait for the run to complete (with timeout)
    const maxWaitTime = 120000; // 2 minutes
    const pollInterval = 3000; // 3 seconds
    let elapsed = 0;
    let status = runData.data.status;

    while (status !== "SUCCEEDED" && status !== "FAILED" && elapsed < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
      elapsed += pollInterval;

      const statusResponse = await fetch(
        `${APIFY_API_BASE}/actor-runs/${runId}?token=${apiToken}`
      );
      const statusData = await statusResponse.json();
      status = statusData.data.status;
    }

    if (status !== "SUCCEEDED") {
      throw new Error(`Apify run did not complete successfully: ${status}`);
    }

    // Fetch the dataset results
    const datasetId = runData.data.defaultDatasetId;
    const datasetResponse = await fetch(
      `${APIFY_API_BASE}/datasets/${datasetId}/items?token=${apiToken}`
    );

    if (!datasetResponse.ok) {
      throw new Error("Failed to fetch Apify dataset");
    }

    const places: ApifyPlaceResult[] = await datasetResponse.json();

    const leads: MapsLead[] = places.map((place, index) => ({
      id: place.placeId || `maps-${index}`,
      name: place.title,
      address: place.address,
      phone: place.phone,
      website: place.website,
      rating: place.totalScore,
      reviewCount: place.reviewsCount,
      category: place.categoryName,
      placeUrl: place.url,
      location: place.location,
    }));

    return {
      leads,
      total: leads.length,
      page: 1,
      perPage: filters.maxResults || 50,
      hasMore: false,
    };
  } catch (error) {
    console.error("Error searching Google Maps via Apify:", error);
    return getMockMapsResults(filters);
  }
}

// ============================================================================
// ASYNC JOB HANDLING (for background processing)
// ============================================================================

interface MapsSearchJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  filters: MapsSearchFilters;
  apifyRunId?: string;
  datasetId?: string;
  resultsCount?: number;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

async function startMapsSearchJob(filters: MapsSearchFilters): Promise<{ jobId: string }> {
  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN not configured");
  }

  // Start the actor run asynchronously (don't wait for completion)
  const actorInput = {
    searchStringsArray: [filters.searchQuery],
    locationQuery: filters.location,
    maxCrawledPlacesPerSearch: filters.maxResults || 50,
    language: filters.language || "es",
    scrapeSocialMediaProfiles: {
      facebooks: false,
      instagrams: false,
      youtubes: false,
      tiktoks: false,
      twitters: false,
    },
    maximumLeadsEnrichmentRecords: 0,
    maxImages: 0,
  };

  const runResponse = await fetch(
    `${APIFY_API_BASE}/acts/compass~crawler-google-places/runs?token=${apiToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(actorInput),
    }
  );

  if (!runResponse.ok) {
    throw new Error(`Failed to start Apify run: ${runResponse.status}`);
  }

  const runData: ApifyRunResponse = await runResponse.json();

  // In production, save this to the database
  // await prisma.leadSearchJob.create({ ... })

  return { jobId: runData.data.id };
}

async function getMapsSearchJobStatus(jobId: string): Promise<MapsSearchJob> {
  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN not configured");
  }

  const statusResponse = await fetch(
    `${APIFY_API_BASE}/actor-runs/${jobId}?token=${apiToken}`
  );

  if (!statusResponse.ok) {
    throw new Error("Failed to get job status");
  }

  const statusData = await statusResponse.json();
  const apifyStatus = statusData.data.status;

  let status: MapsSearchJob["status"];
  if (apifyStatus === "SUCCEEDED") status = "completed";
  else if (apifyStatus === "FAILED" || apifyStatus === "ABORTED") status = "failed";
  else if (apifyStatus === "RUNNING") status = "running";
  else status = "pending";

  return {
    id: jobId,
    status,
    filters: {} as MapsSearchFilters, // Would be retrieved from DB
    apifyRunId: jobId,
    datasetId: statusData.data.defaultDatasetId,
    createdAt: new Date(statusData.data.startedAt),
    completedAt: statusData.data.finishedAt ? new Date(statusData.data.finishedAt) : undefined,
  };
}

async function getMapsSearchJobResults(jobId: string): Promise<MapsLead[]> {
  const apiToken = process.env.APIFY_API_TOKEN;

  if (!apiToken) {
    throw new Error("APIFY_API_TOKEN not configured");
  }

  // Get the job status to get the datasetId
  const job = await getMapsSearchJobStatus(jobId);

  if (job.status !== "completed" || !job.datasetId) {
    throw new Error("Job not completed or dataset not available");
  }

  const datasetResponse = await fetch(
    `${APIFY_API_BASE}/datasets/${job.datasetId}/items?token=${apiToken}`
  );

  if (!datasetResponse.ok) {
    throw new Error("Failed to fetch dataset");
  }

  const places: ApifyPlaceResult[] = await datasetResponse.json();

  return places.map((place, index) => ({
    id: place.placeId || `maps-${index}`,
    name: place.title,
    address: place.address,
    phone: place.phone,
    website: place.website,
    rating: place.totalScore,
    reviewCount: place.reviewsCount,
    category: place.categoryName,
    placeUrl: place.url,
    location: place.location,
  }));
}

// ============================================================================
// MOCK DATA (for development/demo)
// ============================================================================

function getMockB2BResults(filters: B2BSearchFilters): SearchResult<B2BLead> {
  const mockLeads: B2BLead[] = [
    {
      id: "1",
      firstName: "Carlos",
      lastName: "García",
      name: "Carlos García",
      title: "Director de Ventas",
      email: "carlos@techcorp.mx",
      phone: "+52 55 1234 5678",
      linkedinUrl: "https://linkedin.com/in/carlosgarcia",
      company: {
        id: "c1",
        name: "TechCorp México",
        domain: "techcorp.mx",
        industry: "Tecnología",
        size: "51-200",
        location: "Ciudad de México, México",
        linkedinUrl: "https://linkedin.com/company/techcorp",
      },
    },
    {
      id: "2",
      firstName: "María",
      lastName: "López",
      name: "María López",
      title: "CEO",
      email: "maria@innovatech.com",
      phone: "+52 81 9876 5432",
      linkedinUrl: "https://linkedin.com/in/marialopez",
      company: {
        id: "c2",
        name: "InnovaTech",
        domain: "innovatech.com",
        industry: "Software",
        size: "11-50",
        location: "Monterrey, Nuevo León, México",
        linkedinUrl: "https://linkedin.com/company/innovatech",
      },
    },
    {
      id: "3",
      firstName: "Roberto",
      lastName: "Martínez",
      name: "Roberto Martínez",
      title: "Gerente de Marketing",
      email: "roberto@digitalmx.com",
      company: {
        id: "c3",
        name: "Digital MX",
        domain: "digitalmx.com",
        industry: "Marketing Digital",
        size: "11-50",
        location: "Guadalajara, Jalisco, México",
      },
    },
  ];

  return {
    leads: mockLeads,
    total: mockLeads.length,
    page: filters.page || 1,
    perPage: filters.perPage || 25,
    hasMore: false,
  };
}

function getMockMapsResults(filters: MapsSearchFilters): SearchResult<MapsLead> {
  const mockLeads: MapsLead[] = [
    {
      id: "place1",
      name: "Restaurante La Casa Grande",
      address: "Av. Insurgentes Sur 1234, Roma Norte, CDMX",
      phone: "+52 55 1234 5678",
      website: "https://lacasagrande.mx",
      rating: 4.5,
      reviewCount: 342,
      category: "Restaurante",
      placeUrl: "https://maps.google.com/?cid=12345",
    },
    {
      id: "place2",
      name: "Taquería El Patrón",
      address: "Calle Durango 567, Condesa, CDMX",
      phone: "+52 55 9876 5432",
      rating: 4.8,
      reviewCount: 1205,
      category: "Restaurante Mexicano",
      placeUrl: "https://maps.google.com/?cid=67890",
    },
    {
      id: "place3",
      name: "Café Altura",
      address: "Av. Álvaro Obregón 89, Roma Sur, CDMX",
      phone: "+52 55 5555 5555",
      website: "https://cafealtura.com",
      rating: 4.3,
      reviewCount: 89,
      category: "Cafetería",
      placeUrl: "https://maps.google.com/?cid=11111",
    },
  ];

  return {
    leads: mockLeads,
    total: mockLeads.length,
    page: 1,
    perPage: filters.maxResults || 50,
    hasMore: false,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const leadProvider = {
  // B2B Search (Apollo.io)
  searchB2B: searchApolloB2B,

  // Maps Search (Apify Google Places)
  searchMaps: searchGoogleMaps,

  // Async Maps Search (for background jobs)
  startMapsSearchJob,
  getMapsSearchJobStatus,
  getMapsSearchJobResults,
};

