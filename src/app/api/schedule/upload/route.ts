// [Owner: B] POST /api/schedule/upload -> parses an uploaded .ics file and
// creates Enrollment rows for the given student. Manual entry (no file)
// should hit a separate route or the same one with a JSON body — B's call.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseIcsToSessions } from "@/lib/ics/parser";

export async function POST(request: Request) {
  const formData = await request.formData();
  const studentId = formData.get("studentId");
  const file = formData.get("file");

  if (typeof studentId !== "string" || !(file instanceof File)) {
    return NextResponse.json({ error: "studentId and file are required" }, { status: 400 });
  }

  const icsText = await file.text();
  const sessions = parseIcsToSessions(icsText);

  // TODO [B]: upsert Course rows by code before creating Enrollment rows —
  // a course might not exist yet if the student's timetable includes a
  // course not in the seed data.
  return NextResponse.json({ parsedSessionCount: sessions.length, sessions });
}
