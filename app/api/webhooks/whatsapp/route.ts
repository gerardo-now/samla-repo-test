import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/providers/kapsoProvider";

/**
 * Kapso Webhook Handler
 * 
 * Receives webhook events from Kapso Platform for:
 * - Phone number connections
 * - Incoming messages
 * - Message status updates
 * 
 * Docs: https://docs.kapso.ai/docs/platform/webhooks/overview
 */

interface KapsoWebhookEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

// POST /api/webhooks/whatsapp - Receive Kapso webhook events
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-kapso-signature") || "";

    // Verify webhook signature in production
    if (process.env.NODE_ENV === "production" && process.env.KAPSO_WEBHOOK_SECRET) {
      if (!verifyWebhookSignature(rawBody, signature)) {
        console.error("Invalid Kapso webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 }
        );
      }
    }

    const event: KapsoWebhookEvent = JSON.parse(rawBody);
    console.log("Received Kapso webhook:", event.type);

    switch (event.type) {
      case "phone_number.connected":
        await handlePhoneNumberConnected(event.data);
        break;

      case "phone_number.disconnected":
        await handlePhoneNumberDisconnected(event.data);
        break;

      case "message.received":
        await handleIncomingMessage(event.data);
        break;

      case "message.status":
        await handleMessageStatus(event.data);
        break;

      default:
        console.log("Unhandled Kapso event type:", event.type);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error processing Kapso webhook:", error);
    return NextResponse.json(
      { error: "Error processing webhook" },
      { status: 500 }
    );
  }
}

// GET /api/webhooks/whatsapp - Webhook verification (required by some providers)
export async function GET(req: NextRequest) {
  const challenge = req.nextUrl.searchParams.get("hub.challenge");
  const verifyToken = req.nextUrl.searchParams.get("hub.verify_token");

  // Verify the token matches our configured secret
  if (verifyToken === process.env.KAPSO_WEBHOOK_SECRET) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Invalid verify token" }, { status: 403 });
}

/**
 * Handle phone number connection
 * Called when a customer successfully connects their WhatsApp Business
 */
async function handlePhoneNumberConnected(data: Record<string, unknown>) {
  const phoneNumberId = data.phone_number_id as string;
  const customerId = data.customer_id as string;
  const phoneNumber = data.phone_number as string;
  const displayName = data.display_name as string;

  console.log("WhatsApp connected:", {
    phoneNumberId,
    customerId,
    phoneNumber,
    displayName,
  });

  // TODO: In production:
  // 1. Find workspace by customerId (external_customer_id in Kapso)
  // 2. Create/update Channel record in database
  // 3. Mark onboarding checklist item as complete
  // 4. Send notification to workspace admins

  // Example:
  // const workspace = await prisma.workspace.findFirst({
  //   where: { id: customerId },
  // });
  // 
  // await prisma.channel.upsert({
  //   where: { 
  //     workspaceId_type_externalId: {
  //       workspaceId: workspace.id,
  //       type: "WHATSAPP",
  //       externalId: phoneNumberId,
  //     }
  //   },
  //   update: { isActive: true },
  //   create: {
  //     workspaceId: workspace.id,
  //     type: "WHATSAPP",
  //     name: displayName || phoneNumber,
  //     externalId: phoneNumberId,
  //     config: { phoneNumber },
  //   },
  // });
}

/**
 * Handle phone number disconnection
 */
async function handlePhoneNumberDisconnected(data: Record<string, unknown>) {
  const phoneNumberId = data.phone_number_id as string;
  const customerId = data.customer_id as string;

  console.log("WhatsApp disconnected:", { phoneNumberId, customerId });

  // TODO: In production:
  // 1. Find and deactivate the Channel record
  // 2. Notify workspace admins

  // await prisma.channel.update({
  //   where: { externalId: phoneNumberId },
  //   data: { isActive: false },
  // });
}

/**
 * Handle incoming WhatsApp message
 */
async function handleIncomingMessage(data: Record<string, unknown>) {
  const messageId = data.id as string;
  const from = data.from as string;
  const timestamp = data.timestamp as string;
  const phoneNumberId = data.phone_number_id as string;
  const messageType = data.type as string;
  const content = data.text as { body: string } | undefined;

  console.log("Incoming WhatsApp message:", {
    messageId,
    from,
    phoneNumberId,
    messageType,
  });

  // TODO: In production:
  // 1. Find or create conversation
  // 2. Store message in database
  // 3. Trigger AI agent if live mode is enabled
  // 4. Send real-time update to inbox UI

  // Example:
  // const channel = await prisma.channel.findUnique({
  //   where: { externalId: phoneNumberId },
  //   include: { workspace: true },
  // });
  // 
  // const conversation = await prisma.conversation.upsert({
  //   where: {
  //     channelId_externalContactId: {
  //       channelId: channel.id,
  //       externalContactId: from,
  //     },
  //   },
  //   update: { lastMessageAt: new Date(parseInt(timestamp) * 1000) },
  //   create: {
  //     workspaceId: channel.workspaceId,
  //     channelId: channel.id,
  //     externalContactId: from,
  //   },
  // });
  // 
  // await prisma.message.create({
  //   data: {
  //     conversationId: conversation.id,
  //     direction: "INBOUND",
  //     messageType: messageType.toUpperCase(),
  //     content: content?.body,
  //     externalId: messageId,
  //   },
  // });
}

/**
 * Handle message status update (sent, delivered, read, failed)
 */
async function handleMessageStatus(data: Record<string, unknown>) {
  const messageId = data.id as string;
  const status = data.status as string;
  const recipientId = data.recipient_id as string;

  console.log("Message status update:", { messageId, status, recipientId });

  // TODO: In production:
  // Update message status in database

  // await prisma.message.update({
  //   where: { externalId: messageId },
  //   data: { status: status.toUpperCase() },
  // });
}

