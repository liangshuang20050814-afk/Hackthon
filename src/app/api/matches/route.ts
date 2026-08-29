// [Owner: A] GET /api/matches?studentId=... -> MatchResult[] ranked by score.
// Consumed by src/app/matches/page.tsx. See src/lib/types.ts for the
// MatchResult shape that the frontend depends on.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeMatchScore } from "@/lib/matching/scoring";
import { summarizeMatch } from "@/lib/matching/claude";
import type { MatchResult } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  // TODO [A]: replace this per-request O(n) scan with reading cached Match
  // rows once scoring.ts is finalized; recompute only on cache miss.
  const [me, others] = await Promise.all([
    db.student.findUnique({
      where: { id: studentId },
      include: { interests: true, enrollments: { include: { course: true } } },
    }),
    db.student.findMany({
      where: { id: { not: studentId } },
      include: { interests: true, enrollments: { include: { course: true } } },
    }),
  ]);

  if (!me) {
    return NextResponse.json({ error: "student not found" }, { status: 404 });
  }

  const results: MatchResult[] = [];
  for (const other of others) {
    const { score, reasons } = computeMatchScore({
      studentACourses: me.enrollments.map((e) => ({ code: e.course.code, name: e.course.name })),
      studentBCourses: other.enrollments.map((e) => ({ code: e.course.code, name: e.course.name })),
      studentAInterests: me.interests.map((i) => i.label),
      studentBInterests: other.interests.map((i) => i.label),
      // TODO [A]: derive real free-time slots from enrollments instead of [].
      studentAFreeSlots: [],
      studentBFreeSlots: [],
    });

    if (score === 0) continue;

    const aiSummary = await summarizeMatch(me.name, other.name, reasons);
    results.push({ studentId: other.id, score, reasons, aiSummary });
  }

  results.sort((a, b) => b.score - a.score);
  return NextResponse.json(results);
}
