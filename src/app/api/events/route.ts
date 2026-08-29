// [Owner: C] GET events list, POST to join/leave an event.
// No event-creation endpoint by design — see ARCHITECTURE.md.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const events = await db.event.findMany({
    include: { attendees: true },
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { eventId, studentId } = body as { eventId?: string; studentId?: string };

  if (!eventId || !studentId) {
    return NextResponse.json({ error: "eventId and studentId are required" }, { status: 400 });
  }

  // TODO [C]: toggle attendance instead of always creating (join/leave button).
  const attendee = await db.eventAttendee.create({
    data: { eventId, studentId },
  });
  return NextResponse.json(attendee, { status: 201 });
}
