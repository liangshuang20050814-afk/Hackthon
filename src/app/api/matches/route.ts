// [Owner: A] GET /api/matches?studentId=... -> one best general match.
// The timetable/classmate list owns classmate matching percentages.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { computeMatchScore } from "@/lib/matching/scoring";
import { NON_PLACEHOLDER_STUDENT_WHERE } from "@/lib/students/filters";
import type { MatchReason, MatchResult, StudentSummary } from "@/lib/types";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const FREE_WINDOWS = ["09:00-12:00", "12:00-14:00", "14:00-16:00", "16:00-18:00"];
const MATCHING_SERVICE_URL = process.env.MATCHING_SERVICE_URL;

type StudentForMatching = {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  faculty: string;
  yearOfStudy: number;
  major: string | null;
  mbti: string | null;
  interests: { label: string }[];
  enrollments: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    course: { id: string; code: string; name: string };
  }[];
};

type MatchWithStudent = MatchResult & {
  student: StudentSummary;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const returnAll = searchParams.get("all") === "true";

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const [me, others] = await Promise.all([
    db.student.findUnique({
      where: { id: studentId },
      include: { interests: true, enrollments: { include: { course: true } } },
    }),
    db.student.findMany({
      where: { id: { not: studentId }, ...NON_PLACEHOLDER_STUDENT_WHERE },
      include: { interests: true, enrollments: { include: { course: true } } },
    }),
  ]);

  if (!me) {
    return NextResponse.json({ error: "student not found" }, { status: 404 });
  }

  const matches = await buildGeneralMatches(me, others);
  return NextResponse.json(returnAll ? matches : matches[0] ?? null);
}

async function buildGeneralMatches(
  me: StudentForMatching,
  others: StudentForMatching[],
): Promise<MatchWithStudent[]> {
  const pythonResults = await rankWithPython(me, others);
  if (pythonResults) {
    const othersById = new Map(others.map((student) => [student.id, student]));
    return pythonResults
      .map((match) => {
        const student = othersById.get(match.studentId);
        return student ? { ...match, student: toStudentSummary(student) } : null;
      })
      .filter((match): match is MatchWithStudent => match !== null);
  }

  const results: MatchWithStudent[] = [];

  for (const other of others) {
    const { score, reasons } = computeMatchScore({
      studentACourses: uniqueCourses(me.enrollments).map(({ code, name }) => ({ code, name })),
      studentBCourses: uniqueCourses(other.enrollments).map(({ code, name }) => ({ code, name })),
      studentAInterests: me.interests.map((interest) => interest.label),
      studentBInterests: other.interests.map((interest) => interest.label),
      studentAFreeSlots: deriveFreeSlots(me.enrollments),
      studentBFreeSlots: deriveFreeSlots(other.enrollments),
    });

    if (score === 0) continue;

    results.push({
      studentId: other.id,
      student: toStudentSummary(other),
      score,
      reasons,
      aiSummary: summarizeMatch(me.name, other.name, reasons),
    });
  }

  results.sort((a, b) => b.score - a.score || a.student.name.localeCompare(b.student.name));
  return results;
}

async function rankWithPython(
  me: StudentForMatching,
  others: StudentForMatching[],
): Promise<MatchResult[] | null> {
  if (!MATCHING_SERVICE_URL) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${MATCHING_SERVICE_URL}/rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        queryStudent: toPythonStudent(me),
        candidates: others.map(toPythonStudent),
        topK: 20,
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const results = (await response.json()) as MatchResult[];
    return Array.isArray(results) ? results : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function toPythonStudent(student: StudentForMatching) {
  return {
    id: student.id,
    name: student.name,
    faculty: student.faculty,
    yearOfStudy: student.yearOfStudy,
    courses: uniqueCourses(student.enrollments),
    interests: student.interests.map((interest) => interest.label),
    freeSlots: deriveFreeSlots(student.enrollments),
  };
}

function uniqueCourses(enrollments: StudentForMatching["enrollments"]): { id: string; code: string; name: string }[] {
  return Array.from(new Map(enrollments.map((enrollment) => [enrollment.course.id, enrollment.course])).values());
}

function deriveFreeSlots(
  enrollments: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[],
): { day: string; window: string }[] {
  const freeSlots: { day: string; window: string }[] = [];

  for (let dayOfWeek = 0; dayOfWeek < 5; dayOfWeek += 1) {
    const dayEnrollments = enrollments.filter((enrollment) => enrollment.dayOfWeek === dayOfWeek);
    for (const window of FREE_WINDOWS) {
      const [windowStart, windowEnd] = parseWindow(window);
      const hasClass = dayEnrollments.some((enrollment) =>
        rangesOverlap(timeToMinutes(enrollment.startTime), timeToMinutes(enrollment.endTime), windowStart, windowEnd),
      );
      if (!hasClass) {
        freeSlots.push({ day: DAY_LABELS[dayOfWeek], window });
      }
    }
  }

  return freeSlots;
}

function summarizeMatch(studentAName: string, studentBName: string, reasons: MatchReason[]): string {
  const courses = reasons
    .filter((reason) => reason.type === "shared_course")
    .map((reason) => reason.courseCode)
    .filter(Boolean) as string[];
  const interests = reasons
    .filter((reason) => reason.type === "shared_interest")
    .map((reason) => reason.interest)
    .filter(Boolean) as string[];
  const freeTime = reasons.find((reason) => reason.type === "shared_free_time");
  const parts: string[] = [];

  if (courses.length > 0) parts.push(`both take ${joinHuman(courses.slice(0, 2))}`);
  if (interests.length > 0) parts.push(`share ${joinHuman(interests.slice(0, 3))}`);
  if (freeTime?.type === "shared_free_time") parts.push(`are free ${freeTime.day} ${freeTime.window}`);

  if (parts.length === 0) {
    return `${studentAName} and ${studentBName} have overlapping campus signals.`;
  }

  return `${studentAName} and ${studentBName} ${joinHuman(parts)}.`;
}

function toStudentSummary(student: StudentForMatching): StudentSummary {
  return {
    id: student.id,
    name: student.name,
    avatarUrl: student.avatarUrl,
    faculty: student.faculty,
    yearOfStudy: student.yearOfStudy,
    bio: student.bio,
    major: student.major,
    mbti: student.mbti,
    interests: student.interests.map((interest) => interest.label),
  };
}

function parseWindow(window: string): [number, number] {
  const [start, end] = window.split("-");
  return [timeToMinutes(start), timeToMinutes(end)];
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function rangesOverlap(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && startB < endA;
}

function joinHuman(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}
