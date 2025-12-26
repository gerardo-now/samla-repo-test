import { NextResponse } from "next/server";
import { requireSuperAdmin } from "@/lib/auth/adminGuard";

/**
 * GET /api/admin/workspaces
 * 
 * List all workspaces (customers) in the platform.
 * SUPER ADMIN ONLY - SAMLA internal team access.
 */
export async function GET() {
  // Verify super admin access
  const guard = await requireSuperAdmin();
  if (!guard.authorized) return guard.response;

  try {
    // TODO: Fetch from database
    // const workspaces = await prisma.workspace.findMany({
    //   include: {
    //     subscription: true,
    //     _count: {
    //       select: { members: true, conversations: true },
    //     },
    //   },
    //   orderBy: { createdAt: "desc" },
    // });

    // Mock data for development
    const workspaces = [
      {
        id: "ws_1",
        name: "Clínica Dental García",
        slug: "clinica-dental-garcia",
        plan: "Growth",
        status: "active",
        memberCount: 5,
        conversationsThisMonth: 342,
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "ws_2",
        name: "Inmobiliaria MX",
        slug: "inmobiliaria-mx",
        plan: "Pro",
        status: "active",
        memberCount: 12,
        conversationsThisMonth: 1205,
        createdAt: new Date("2024-02-20"),
      },
      {
        id: "ws_3",
        name: "Restaurante El Sabor",
        slug: "restaurante-el-sabor",
        plan: "Starter",
        status: "trial",
        memberCount: 2,
        conversationsThisMonth: 87,
        createdAt: new Date("2024-03-10"),
      },
    ];

    return NextResponse.json({ success: true, workspaces });
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener espacios de trabajo" },
      { status: 500 }
    );
  }
}

