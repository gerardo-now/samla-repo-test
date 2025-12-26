import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

/**
 * POST /api/calendar/book
 * Book a time slot on the calendar
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const {
      connectionId,
      startTime,
      endTime,
      title,
      description,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      contactId,
    } = body;

    if (!startTime || !endTime || !title) {
      return NextResponse.json(
        { error: "startTime, endTime y title son requeridos" },
        { status: 400 }
      );
    }

    // In production:
    // const connection = await prisma.calendarConnection.findFirst({
    //   where: connectionId ? { id: connectionId } : { userId, isDefault: true },
    // });
    //
    // const provider = createCalendarProvider(connection.provider, {
    //   accessToken: connection.accessToken,
    //   refreshToken: connection.refreshToken,
    //   tokenExpiresAt: connection.tokenExpiresAt,
    // });
    //
    // const event = await provider.createEvent(
    //   connection.selectedCalendarId || 'primary',
    //   {
    //     title,
    //     description,
    //     startTime: new Date(startTime),
    //     endTime: new Date(endTime),
    //     timezone: 'America/Mexico_City',
    //     attendeeEmail,
    //     attendeeName,
    //   }
    // );
    //
    // // Save to database
    // const calendarEvent = await prisma.calendarEvent.create({
    //   data: {
    //     workspaceId: connection.workspaceId,
    //     calendarConnectionId: connection.id,
    //     externalEventId: event.externalId,
    //     title,
    //     description,
    //     startTime: new Date(startTime),
    //     endTime: new Date(endTime),
    //     timezone: 'America/Mexico_City',
    //     attendeeEmail,
    //     attendeeName,
    //     attendeePhone,
    //     contactId,
    //     status: 'CONFIRMED',
    //   },
    // });

    const eventId = `evt_${Date.now()}`;

    console.log("Event booked:", {
      eventId,
      startTime,
      endTime,
      title,
      attendeeName,
      attendeeEmail,
    });

    return NextResponse.json({
      success: true,
      eventId,
      message: "Cita agendada exitosamente",
    });
  } catch (error) {
    console.error("Error booking event:", error);
    return NextResponse.json(
      { error: "Error al agendar la cita" },
      { status: 500 }
    );
  }
}

