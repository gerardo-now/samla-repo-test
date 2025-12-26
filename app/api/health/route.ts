import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * 
 * Used by Railway to verify the service is running.
 * Returns 200 OK if the service is healthy.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "samla",
  });
}

// Ensure this is always dynamic
export const dynamic = "force-dynamic";

