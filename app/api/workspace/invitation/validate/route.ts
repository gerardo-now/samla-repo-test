import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Código de invitación requerido" },
        { status: 400 }
      );
    }

    // In production, validate against database
    // const invitation = await prisma.workspaceInvitation.findUnique({
    //   where: { code },
    //   include: {
    //     workspace: true,
    //     inviter: true,
    //   },
    // });

    // For demo, check if it's a valid format
    if (!code.startsWith("INV-") && code.length < 8) {
      return NextResponse.json(
        { error: "Invitación inválida" },
        { status: 404 }
      );
    }

    // Demo response - in production this would come from database
    return NextResponse.json({
      valid: true,
      workspaceName: "Empresa Demo",
      inviterName: "Usuario Demo",
      email: "invitado@ejemplo.com",
      role: "member",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "Error al validar invitación" },
      { status: 500 }
    );
  }
}

