import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const dynamic = "force-dynamic";

/**
 * GET /api/calendar/availability
 * Get available time slots for booking
 */
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const duration = parseInt(searchParams.get("duration") || "30", 10);
    const connectionId = searchParams.get("connectionId");

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate y endDate son requeridos" },
        { status: 400 }
      );
    }

    // In production, fetch from calendar provider:
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
    // const slots = await provider.getAvailableSlots({
    //   calendarId: connection.selectedCalendarId || 'primary',
    //   startDate: new Date(startDate),
    //   endDate: new Date(endDate),
    //   workingHoursStart: connection.workingHoursStart,
    //   workingHoursEnd: connection.workingHoursEnd,
    //   workingDays: connection.workingDays,
    //   slotDuration: duration,
    //   bufferTime: connection.bufferMinutes,
    //   timezone: 'America/Mexico_City',
    // });

    // Generate demo slots
    const slots = generateDemoSlots(
      new Date(startDate),
      new Date(endDate),
      duration
    );

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Error al obtener disponibilidad" },
      { status: 500 }
    );
  }
}

function generateDemoSlots(startDate: Date, endDate: Date, duration: number) {
  const slots: Array<{ start: string; end: string; available: boolean }> = [];
  const current = new Date(startDate);

  while (current < endDate) {
    const dayOfWeek = current.getDay();
    
    // Only Monday to Friday
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      // Working hours: 9 AM to 6 PM
      for (let hour = 9; hour < 18; hour++) {
        for (let min = 0; min < 60; min += duration) {
          if (hour === 17 && min + duration > 60) break;

          const slotStart = new Date(current);
          slotStart.setHours(hour, min, 0, 0);

          const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

          // Only future slots
          if (slotStart > new Date()) {
            // Random availability (80% available for demo)
            const available = Math.random() > 0.2;
            
            slots.push({
              start: slotStart.toISOString(),
              end: slotEnd.toISOString(),
              available,
            });
          }
        }
      }
    }

    current.setDate(current.getDate() + 1);
    current.setHours(0, 0, 0, 0);
  }

  return slots.filter(s => s.available).slice(0, 20); // Limit for demo
}

