import { NextRequest, NextResponse } from "next/server";

// This API uses Kapso Platform internally for WhatsApp Business
// The provider name is NEVER exposed to the frontend

interface ConnectRequest {
  workspaceId: string;
}

// POST /api/channels/whatsapp/connect - Generate QR code for WhatsApp connection
export async function POST(req: NextRequest) {
  try {
    const body: ConnectRequest = await req.json();
    const { workspaceId } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace requerido" },
        { status: 400 }
      );
    }

    // In production: Use Kapso API to generate QR code
    // const response = await fetch('https://api.kapso.io/v1/whatsapp/qr', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${process.env.KAPSO_API_KEY}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     workspace_id: workspaceId,
    //     webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/whatsapp`,
    //   }),
    // });
    // const data = await response.json();

    // For demo: Return simulated QR data
    const sessionId = `session_${Date.now()}`;
    
    return NextResponse.json({
      success: true,
      sessionId,
      // In production: qrCode would be base64 or URL from Kapso
      qrCode: null, // Will be fetched via polling
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    });

  } catch (error) {
    console.error("Error generating WhatsApp QR:", error);
    return NextResponse.json(
      { error: "Error al generar código QR" },
      { status: 500 }
    );
  }
}

// GET /api/channels/whatsapp/connect?sessionId=xxx - Check connection status
export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID requerido" },
        { status: 400 }
      );
    }

    // In production: Poll Kapso API for connection status
    // const response = await fetch(`https://api.kapso.io/v1/whatsapp/status/${sessionId}`, {
    //   headers: {
    //     'Authorization': `Bearer ${process.env.KAPSO_API_KEY}`,
    //   },
    // });
    // const data = await response.json();

    // For demo: Simulate status
    return NextResponse.json({
      success: true,
      status: "pending", // "pending" | "connected" | "expired"
      qrCode: "data:image/png;base64,iVBORw0KGgo...", // Base64 QR image
    });

  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return NextResponse.json(
      { error: "Error al verificar estado" },
      { status: 500 }
    );
  }
}

