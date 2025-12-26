import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with actual Prisma and auth
// Mock team members for demo
const mockTeamMembers = [
  { 
    id: "1", 
    name: "Juan Pérez", 
    email: "juan@empresa.com", 
    initials: "JP",
    role: "admin",
    avatarUrl: null 
  },
  { 
    id: "2", 
    name: "María García", 
    email: "maria@empresa.com", 
    initials: "MG",
    role: "member",
    avatarUrl: null 
  },
  { 
    id: "3", 
    name: "Carlos López", 
    email: "carlos@empresa.com", 
    initials: "CL",
    role: "member",
    avatarUrl: null 
  },
  { 
    id: "4", 
    name: "Ana Martínez", 
    email: "ana@empresa.com", 
    initials: "AM",
    role: "member",
    avatarUrl: null 
  },
];

export async function GET(req: NextRequest) {
  try {
    // TODO: Get actual workspace members from database
    // const workspaceId = get from auth context
    // const members = await prisma.workspaceMember.findMany({
    //   where: { workspaceId },
    //   include: { user: true }
    // });

    return NextResponse.json({
      success: true,
      members: mockTeamMembers,
    });
  } catch (error) {
    console.error("Error fetching team members:", error);
    return NextResponse.json(
      { success: false, error: "Error al obtener miembros del equipo" },
      { status: 500 }
    );
  }
}

