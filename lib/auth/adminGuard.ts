import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isSamlaEmail } from "./superAdmin";

export interface AdminUser {
  id: string;
  email: string;
  isSuperAdmin: boolean;
}

interface AdminGuardResult {
  authorized: boolean;
  user?: AdminUser;
  response?: NextResponse;
}

/**
 * Guard for admin API routes
 * 
 * Use this at the start of any /api/admin/* route handler.
 * Returns unauthorized response if user is not a SAMLA super admin.
 * 
 * @example
 * export async function GET() {
 *   const guard = await requireSuperAdmin();
 *   if (!guard.authorized) return guard.response;
 *   
 *   // User is authorized, proceed with admin logic
 *   const user = guard.user;
 * }
 */
export async function requireSuperAdmin(): Promise<AdminGuardResult> {
  const user = await currentUser();

  if (!user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      ),
    };
  }

  const email = user.emailAddresses?.[0]?.emailAddress || "";
  const hasAdminMetadata = user.publicMetadata?.isSuperAdmin === true;
  const isSamlaTeam = isSamlaEmail(email);

  if (!isSamlaTeam && !hasAdminMetadata) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "Acceso denegado: Solo el equipo de SAMLA puede acceder" },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true,
    user: {
      id: user.id,
      email,
      isSuperAdmin: true,
    },
  };
}

