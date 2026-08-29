import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { eventId: string } }) {
  const currentStudentId = getCurrentStudentId();
  const event = await db.event.findUnique({
    where: { id: params.eventId },
    include: {
      creator: { select: { id: true, name: true, avatarUrl: true } },
      attendees: {
        include: {
          student: {
            select: { id: true, name: true, avatarUrl: true, faculty: true, major: true, yearOfStudy: true },
          },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  return NextResponse.json({
    ...event,
    joined: event.attendees.some((attendee) => attendee.studentId === currentStudentId),
    isCreator: event.creatorId === currentStudentId,
    attendeeCount: event.attendees.length,
  });
}
