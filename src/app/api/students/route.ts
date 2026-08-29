// [Owner: A] GET /api/students -> list of students with courses + interests.
// Used by B (classmates list) and C (chat/event attendee lookups).
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const students = await db.student.findMany({
    include: { interests: true, enrollments: { include: { course: true } } },
  });
  return NextResponse.json(students);
}
