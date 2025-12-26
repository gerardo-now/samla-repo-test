/**
 * Kapso Platform Provider
 * 
 * Integrates with Kapso Platform API for WhatsApp Business connectivity.
 * Docs: https://docs.kapso.ai/docs/platform/getting-started
 * 
 * INTERNAL USE ONLY - Never expose provider name to UI
 */

import { createHmac } from "crypto";

const KAPSO_API_KEY = process.env.KAPSO_API_KEY || "";
const PLATFORM_API_URL = "https://api.kapso.ai/platform/v1";
const WHATSAPP_API_URL = "https://api.kapso.ai/meta/whatsapp";

interface KapsoCustomer {
  id: string;
  name: string;
  external_customer_id?: string;
}

interface KapsoSetupLink {
  id: string;
  url: string;
  expires_at: string;
}

interface KapsoPhoneNumber {
  id: string;
  phone_number: string;
  display_name?: string;
  status: "active" | "pending" | "disconnected";
}

interface KapsoResponse<T> {
  data: T;
}

/**
 * Create a customer in Kapso Platform
 * Each SAMLA workspace maps to one Kapso customer
 */
export async function createKapsoCustomer(
  workspaceId: string,
  workspaceName: string
): Promise<KapsoCustomer> {
  const response = await fetch(`${PLATFORM_API_URL}/customers`, {
    method: "POST",
    headers: {
      "X-API-Key": KAPSO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      customer: {
        name: workspaceName,
        external_customer_id: workspaceId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Kapso customer: ${error}`);
  }

  const result: KapsoResponse<KapsoCustomer> = await response.json();
  return result.data;
}

/**
 * Get existing customer by external ID (workspace ID)
 */
export async function getKapsoCustomerByExternalId(
  workspaceId: string
): Promise<KapsoCustomer | null> {
  const response = await fetch(
    `${PLATFORM_API_URL}/customers?external_customer_id=${workspaceId}`,
    {
      headers: {
        "X-API-Key": KAPSO_API_KEY,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const result = await response.json();
  return result.data?.[0] || null;
}

/**
 * Generate a setup link for WhatsApp Business connection
 * The user clicks this link to connect their WhatsApp through Facebook
 */
export async function generateSetupLink(
  kapsoCustomerId: string,
  redirectUrl?: string
): Promise<KapsoSetupLink> {
  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kapsoProvider.ts:generateSetupLink:entry',message:'Function entry',data:{kapsoCustomerId,redirectUrl,redirectUrlType:typeof redirectUrl,redirectUrlLength:redirectUrl?.length,hasApiKey:!!KAPSO_API_KEY,apiKeyLength:KAPSO_API_KEY?.length},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,D,E'})}).catch(()=>{});
  // #endregion

  const requestBody = {
    setup_link: {
      redirect_url: redirectUrl,
    },
  };

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kapsoProvider.ts:generateSetupLink:body',message:'Request body before stringify',data:{requestBody,stringifiedBody:JSON.stringify(requestBody),setupLinkKeys:Object.keys(requestBody.setup_link)},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'B,C,D'})}).catch(()=>{});
  // #endregion

  const response = await fetch(
    `${PLATFORM_API_URL}/customers/${kapsoCustomerId}/setup_links`,
    {
      method: "POST",
      headers: {
        "X-API-Key": KAPSO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    }
  );

  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kapsoProvider.ts:generateSetupLink:response',message:'Kapso API response',data:{status:response.status,statusText:response.statusText,ok:response.ok},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C,E'})}).catch(()=>{});
  // #endregion

  if (!response.ok) {
    const error = await response.text();
    // #region agent log
    fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kapsoProvider.ts:generateSetupLink:error',message:'Kapso API error response',data:{error,status:response.status},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'A,B,C,E'})}).catch(()=>{});
    // #endregion
    throw new Error(`Failed to generate setup link: ${error}`);
  }

  const result: KapsoResponse<KapsoSetupLink> = await response.json();
  // #region agent log
  fetch('http://127.0.0.1:7249/ingest/46f253e4-af93-4a18-af5e-39a9403a9c24',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'kapsoProvider.ts:generateSetupLink:success',message:'Setup link generated successfully',data:{resultData:result.data},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'success'})}).catch(()=>{});
  // #endregion
  return result.data;
}

/**
 * List phone numbers connected to a customer
 */
export async function listPhoneNumbers(
  kapsoCustomerId: string
): Promise<KapsoPhoneNumber[]> {
  const response = await fetch(
    `${PLATFORM_API_URL}/customers/${kapsoCustomerId}/phone_numbers`,
    {
      headers: {
        "X-API-Key": KAPSO_API_KEY,
      },
    }
  );

  if (!response.ok) {
    return [];
  }

  const result = await response.json();
  return result.data || [];
}

/**
 * Get a specific phone number
 */
export async function getPhoneNumber(
  phoneNumberId: string
): Promise<KapsoPhoneNumber | null> {
  const response = await fetch(
    `${PLATFORM_API_URL}/phone_numbers/${phoneNumberId}`,
    {
      headers: {
        "X-API-Key": KAPSO_API_KEY,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const result: KapsoResponse<KapsoPhoneNumber> = await response.json();
  return result.data;
}

/**
 * Send a WhatsApp text message
 */
export async function sendTextMessage(
  phoneNumberId: string,
  recipientPhone: string,
  messageBody: string
): Promise<{ messageId: string }> {
  const response = await fetch(
    `${WHATSAPP_API_URL}/v24.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "X-API-Key": KAPSO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "text",
        text: {
          body: messageBody,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send message: ${error}`);
  }

  const result = await response.json();
  return { messageId: result.messages?.[0]?.id };
}

/**
 * Send a WhatsApp template message
 */
export async function sendTemplateMessage(
  phoneNumberId: string,
  recipientPhone: string,
  templateName: string,
  languageCode: string,
  components?: Array<{
    type: "header" | "body" | "button";
    parameters: Array<{ type: string; text?: string; image?: { link: string } }>;
  }>
): Promise<{ messageId: string }> {
  const response = await fetch(
    `${WHATSAPP_API_URL}/v24.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "X-API-Key": KAPSO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: languageCode,
          },
          components,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send template message: ${error}`);
  }

  const result = await response.json();
  return { messageId: result.messages?.[0]?.id };
}

/**
 * Upload media to Kapso for sending
 */
export async function uploadMedia(
  phoneNumberId: string,
  fileBlob: Blob,
  mimeType: string
): Promise<{ mediaId: string }> {
  const formData = new FormData();
  formData.append("file", fileBlob);
  formData.append("messaging_product", "whatsapp");
  formData.append("type", mimeType);

  const response = await fetch(
    `${WHATSAPP_API_URL}/v24.0/${phoneNumberId}/media`,
    {
      method: "POST",
      headers: {
        "X-API-Key": KAPSO_API_KEY,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to upload media: ${error}`);
  }

  const result = await response.json();
  return { mediaId: result.id };
}

/**
 * Verify webhook signature from Kapso
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const webhookSecret = process.env.KAPSO_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(payload)
    .digest("hex");

  return signature === expectedSignature;
}

