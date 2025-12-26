import { NextRequest, NextResponse } from "next/server";
import {
  createKapsoCustomer,
  getKapsoCustomerByExternalId,
  generateSetupLink,
  listPhoneNumbers,
} from "@/lib/providers/kapsoProvider";

/**
 * WhatsApp Connection API
 * 
 * Uses Kapso Platform internally for WhatsApp Business connectivity.
 * Flow based on: https://docs.kapso.ai/docs/platform/getting-started
 * 
 * The provider name (Kapso) is NEVER exposed to the frontend.
 */

interface ConnectRequest {
  workspaceId: string;
  workspaceName: string;
}

// POST /api/channels/whatsapp/connect - Generate setup link for WhatsApp connection
export async function POST(req: NextRequest) {
  try {
    const body: ConnectRequest = await req.json();
    const { workspaceId, workspaceName } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace requerido" },
        { status: 400 }
      );
    }

    // Check if Kapso API key is configured
    if (!process.env.KAPSO_API_KEY) {
      console.error("KAPSO_API_KEY not configured");
      return NextResponse.json(
        { error: "Servicio de mensajería no configurado" },
        { status: 503 }
      );
    }

    // Step 1: Check if customer already exists in Kapso
    let kapsoCustomer = await getKapsoCustomerByExternalId(workspaceId);

    // Step 2: Create customer if not exists
    if (!kapsoCustomer) {
      kapsoCustomer = await createKapsoCustomer(
        workspaceId,
        workspaceName || "Workspace"
      );
    }

    // Step 3: Generate setup link
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const redirectUrl = `${appUrl}/settings?tab=channels&connected=whatsapp`;
    
    // #region agent log
    fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:POST:redirectUrl',message:'Checking redirect URL construction',data:{appUrl,appUrlType:typeof appUrl,appUrlEmpty:appUrl==='',redirectUrl,kapsoCustomerId:kapsoCustomer.id},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    
    const setupLink = await generateSetupLink(kapsoCustomer.id, redirectUrl);

    return NextResponse.json({
      success: true,
      setupUrl: setupLink.url,
      expiresAt: setupLink.expires_at,
      message: "Abre el enlace para conectar tu WhatsApp Business",
    });

  } catch (error) {
    console.error("Error generating WhatsApp setup link:", error);
    return NextResponse.json(
      { error: "Error al generar enlace de configuración" },
      { status: 500 }
    );
  }
}

// GET /api/channels/whatsapp/connect?workspaceId=xxx - Check connection status
export async function GET(req: NextRequest) {
  try {
    const workspaceId = req.nextUrl.searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json(
        { error: "Workspace ID requerido" },
        { status: 400 }
      );
    }

    // Check if Kapso API key is configured
    if (!process.env.KAPSO_API_KEY) {
      return NextResponse.json({
        success: true,
        connected: false,
        phoneNumbers: [],
      });
    }

    // Get Kapso customer
    const kapsoCustomer = await getKapsoCustomerByExternalId(workspaceId);

    if (!kapsoCustomer) {
      return NextResponse.json({
        success: true,
        connected: false,
        phoneNumbers: [],
      });
    }

    // List connected phone numbers
    const phoneNumbers = await listPhoneNumbers(kapsoCustomer.id);
    const activePhoneNumbers = phoneNumbers.filter(
      (pn) => pn.status === "active"
    );

    return NextResponse.json({
      success: true,
      connected: activePhoneNumbers.length > 0,
      phoneNumbers: activePhoneNumbers.map((pn) => ({
        id: pn.id,
        phoneNumber: pn.phone_number,
        displayName: pn.display_name,
      })),
    });

  } catch (error) {
    console.error("Error checking WhatsApp status:", error);
    return NextResponse.json(
      { error: "Error al verificar estado" },
      { status: 500 }
    );
  }
}
