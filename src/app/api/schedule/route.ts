import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

const COURSE_CODE_PATTERN = /^[A-Z]{4}\d{4}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function currentStudentId() {
  return getCurrentStudentId();
}

export async function GET() {
  const enrollments = await db.enrollment.findMany({
    where: { studentId: currentStudentId() },
    include: { course: true },
    orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
  });
  return NextResponse.json(enrollments);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const courseCode = typeof body.courseCode === "string" ? body.courseCode.trim().toUpperCase() : "";
  const courseName = typeof body.courseName === "string" ? body.courseName.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const dayOfWeek = body.dayOfWeek;
  const startTime = body.startTime;
  const endTime = body.endTime;

  if (!COURSE_CODE_PATTERN.test(courseCode)) {
    return NextResponse.json({ error: "Use a course code such as COMP2017." }, { status: 400 });
  }
  if (!Number.isInteger(dayOfWeek) || Number(dayOfWeek) < 0 || Number(dayOfWeek) > 6) {
    return NextResponse.json({ error: "Choose a valid weekday." }, { status: 400 });
  }
  if (typeof startTime !== "string" || typeof endTime !== "string" ||
      !TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime) || startTime >= endTime) {
    return NextResponse.json({ error: "End time must be later than start time." }, { status: 400 });
  }

  const studentId = currentStudentId();
  const student = await db.student.findUnique({ where: { id: studentId }, select: { id: true } });
  if (!student) {
    return NextResponse.json({ error: "Demo student is not seeded yet." }, { status: 409 });
  }

  const course = await db.course.upsert({
    where: { code: courseCode },
    update: courseName ? { name: courseName } : {},
    create: { code: courseCode, name: courseName || courseCode },
  });

  const duplicate = await db.enrollment.findFirst({
    where: { studentId, courseId: course.id, dayOfWeek: Number(dayOfWeek), startTime, endTime },
  });
  if (duplicate) {
    return NextResponse.json({ error: "This class is already in your timetable." }, { status: 409 });
  }

  const enrollment = await db.enrollment.create({
    data: {
      studentId,
      courseId: course.id,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      location: location || null,
    },
    include: { course: true },
  });
  return NextResponse.json(enrollment, { status: 201 });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Enrollment id is required." }, { status: 400 });

  const enrollment = await db.enrollment.findFirst({
    where: { id, studentId: currentStudentId() },
    select: { id: true },
  });
  if (!enrollment) return NextResponse.json({ error: "Class not found." }, { status: 404 });

  await db.enrollment.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
