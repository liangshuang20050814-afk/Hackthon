import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/demo-user";
import { isEventType } from "@/lib/events";

export const dynamic = "force-dynamic";

const attendeeInclude = {
  student: { select: { id: true, name: true, avatarUrl: true } },
};

export async function GET(request: Request) {
  const currentStudentId = getCurrentStudentId();
  const mine = new URL(request.url).searchParams.get("mine") === "true";
  const events = await db.event.findMany({
    where: mine ? { attendees: { some: { studentId: currentStudentId } } } : undefined,
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      attendees: { include: attendeeInclude },
    },
    orderBy: { startsAt: "asc" },
  });

  return NextResponse.json(events.map((event) => ({
    ...event,
    joined: event.attendees.some((attendee) => attendee.studentId === currentStudentId),
    isCreator: event.creatorId === currentStudentId,
    attendeeCount: event.attendees.length,
  })));
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const action = body.action;
  const studentId = getCurrentStudentId();
  const student = await db.student.findUnique({ where: { id: studentId }, select: { id: true } });
  if (!student) return NextResponse.json({ error: "Current student was not found." }, { status: 409 });

  if (action === "create") {
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const location = typeof body.location === "string" ? body.location.trim() : "";
    const startsAt = typeof body.startsAt === "string" ? new Date(body.startsAt) : new Date(Number.NaN);
    const durationMinutes = Number(body.durationMinutes);
    const capacity = Number(body.capacity);

    if (title.length < 2 || title.length > 80) {
      return NextResponse.json({ error: "Event name must be 2–80 characters." }, { status: 400 });
    }
    if (!isEventType(body.eventType)) {
      return NextResponse.json({ error: "Choose a valid event type." }, { status: 400 });
    }
    if (Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Choose a valid date and time." }, { status: 400 });
    }
    if (!Number.isInteger(durationMinutes) || durationMinutes < 15 || durationMinutes > 1440) {
      return NextResponse.json({ error: "Duration must be between 15 minutes and 24 hours." }, { status: 400 });
    }
    if (!Number.isInteger(capacity) || capacity < 2 || capacity > 100) {
      return NextResponse.json({ error: "Number of people must be between 2 and 100." }, { status: 400 });
    }

    const event = await db.event.create({
      data: {
        title,
        description,
        location: location || "Campus",
        eventType: body.eventType,
        startsAt,
        durationMinutes,
        capacity,
        creatorId: studentId,
        attendees: { create: { studentId } },
      },
      include: {
        creator: { select: { id: true, name: true, avatarUrl: true } },
        attendees: { include: attendeeInclude },
      },
    });
    return NextResponse.json({ ...event, joined: true, isCreator: true, attendeeCount: 1 }, { status: 201 });
  }

  const eventId = typeof body.eventId === "string" ? body.eventId : "";
  if (!eventId || (action !== "join" && action !== "leave")) {
    return NextResponse.json({ error: "A valid action and eventId are required." }, { status: 400 });
  }

  const event = await db.event.findUnique({
    where: { id: eventId },
    include: { attendees: { select: { studentId: true } } },
  });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const alreadyJoined = event.attendees.some((attendee) => attendee.studentId === studentId);
  if (action === "join") {
    if (alreadyJoined) {
      return NextResponse.json({ joined: true, attendeeCount: event.attendees.length });
    }
    if (event.attendees.length >= event.capacity) {
      return NextResponse.json({ error: "This event is full." }, { status: 409 });
    }
    await db.eventAttendee.create({ data: { eventId, studentId } });
    return NextResponse.json({ joined: true, attendeeCount: event.attendees.length + 1 });
  }

  if (event.creatorId === studentId) {
    return NextResponse.json({ error: "The event creator cannot leave their own event." }, { status: 409 });
  }
  await db.eventAttendee.deleteMany({ where: { eventId, studentId } });
  return NextResponse.json({ joined: false, attendeeCount: Math.max(0, event.attendees.length - (alreadyJoined ? 1 : 0)) });
}
