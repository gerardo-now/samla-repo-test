import { NextResponse } from "next/server";
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { validateWorkspaceName, isReservedSlug } from "@/lib/validation/reservedNames";
import { getSingleRegion } from "@/lib/billing/regions";

// Helper to generate slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 50);
}

// Check if Clerk is configured
function isClerkConfigured(): boolean {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secret = process.env.CLERK_SECRET_KEY;
  if (!key || !secret) return false;
  if (!key.startsWith("pk_")) return false;
  if (key.length < 50) return false;
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, industry, timezone, language, countries, billingRegion } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "El nombre de la empresa es requerido" },
        { status: 400 }
      );
    }

    // Validate workspace name (check for reserved names)
    const nameValidation = validateWorkspaceName(name);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    if (!industry || typeof industry !== "string") {
      return NextResponse.json(
        { error: "La industria es requerida" },
        { status: 400 }
      );
    }

    // Generate a unique slug
    const baseSlug = generateSlug(name);
    
    // Check if slug is reserved
    if (isReservedSlug(baseSlug)) {
      return NextResponse.json(
        { error: "Este nombre genera una URL reservada. Por favor usa otro nombre." },
        { status: 400 }
      );
    }
    
    const timestamp = Date.now().toString(36);
    const slug = `${baseSlug}-${timestamp}`;

    // Validate language (default to Spanish if not provided)
    const validLanguages = ["es", "en", "pt"];
    const workspaceLanguage = validLanguages.includes(language) ? language : "es";

    // Determine billing region
    const resolvedRegion = billingRegion || getSingleRegion(countries || []) || "LATAM";

    // Get authenticated user if Clerk is configured
    let clerkUserId: string | null = null;
    let userEmail: string | null = null;
    let firstName: string | null = null;
    let lastName: string | null = null;

    if (isClerkConfigured()) {
      try {
        const { userId } = await auth();
        clerkUserId = userId;
        
        const user = await currentUser();
        if (user) {
          userEmail = user.emailAddresses?.[0]?.emailAddress || null;
          firstName = user.firstName;
          lastName = user.lastName;
        }
      } catch (e) {
        console.warn("Could not get Clerk user:", e);
      }
    }

    // Create workspace with transaction
    const result = await db.$transaction(async (tx) => {
      // First, find or create the user
      let dbUser = null;
      
      if (clerkUserId && userEmail) {
        dbUser = await tx.user.upsert({
          where: { clerkId: clerkUserId },
          update: {
            email: userEmail,
            firstName,
            lastName,
          },
          create: {
            clerkId: clerkUserId,
            email: userEmail,
            firstName,
            lastName,
          },
        });
      }

      // Create the workspace
      const workspace = await tx.workspace.create({
        data: {
          name: name.trim(),
          slug,
          timezone: timezone || "America/Mexico_City",
          language: workspaceLanguage,
          billingRegion: resolvedRegion,
          billingCountry: countries?.[0] || null,
          // Create onboarding checklist
          onboardingChecklist: {
            create: {},
          },
          // Create initial subscription (inactive until billing is set up)
          subscription: {
            create: {
              planCode: "starter",
              regionCode: resolvedRegion,
              status: "INACTIVE",
            },
          },
        },
      });

      // Add user as owner if we have a user
      if (dbUser) {
        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: dbUser.id,
            role: "OWNER",
          },
        });
      }

      return workspace;
    });

    // Update Clerk user metadata to mark onboarding as complete
    if (clerkUserId && isClerkConfigured()) {
      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(clerkUserId, {
          publicMetadata: {
            currentWorkspaceId: result.id,
            onboardingComplete: true,
            preferredLanguage: workspaceLanguage,
          },
        });
      } catch (e) {
        console.warn("Could not update Clerk metadata:", e);
      }
    }

    return NextResponse.json({
      success: true,
      workspaceId: result.id,
      slug: result.slug,
      message: "Espacio de trabajo creado exitosamente",
    });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { error: "Error al crear el espacio de trabajo" },
      { status: 500 }
    );
  }
}
