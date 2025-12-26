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
  const response = await fetch(
    `${PLATFORM_API_URL}/customers/${kapsoCustomerId}/setup_links`,
    {
      method: "POST",
      headers: {
        "X-API-Key": KAPSO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        setup_link: {
          redirect_url: redirectUrl,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to generate setup link: ${error}`);
  }

  const result: KapsoResponse<KapsoSetupLink> = await response.json();
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

