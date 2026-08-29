// [Owner: A] GET /api/students -> list of students with courses + interests.
// Used by B (classmates list) and C (chat/event attendee lookups).
//
// [Owner: D] passwordHash is stripped before the response goes out — never
// let a bcrypt hash (or the plaintext it was derived from) leave the
// server, even to your own logged-in client. Account creation now happens
// at POST /api/auth/signup; onboarding (src/app/onboarding/page.tsx)
// completes that same row via PATCH /api/students/[studentId] instead of
// creating a second one, so this file no longer needs its own POST.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const students = await db.student.findMany({
    include: { interests: true, enrollments: { include: { course: true } } },
  });
  const safe = students.map(({ passwordHash, ...student }) => student);
  return NextResponse.json(safe);
}
