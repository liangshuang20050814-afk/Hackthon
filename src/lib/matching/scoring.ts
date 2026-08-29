// [Owner: A] Explainable scoring algorithm — this is the feature that
// differentiates the app from a generic dating-app clone. Never return a
// bare number: every point of `score` must trace back to a MatchReason.
import type { MatchReason } from "@/lib/types";

// TODO [A]: tune these weights against the seeded data so scores spread out
// (avoid everyone landing at 90-100%).
const WEIGHTS = {
  sharedCourse: 25,
  sharedInterest: 10,
  sharedFreeTime: 15,
};

export interface ScoringInput {
  studentACourses: { code: string; name: string }[];
  studentBCourses: { code: string; name: string }[];
  studentAInterests: string[];
  studentBInterests: string[];
  studentAFreeSlots: { day: string; window: string }[];
  studentBFreeSlots: { day: string; window: string }[];
}

export interface ScoringOutput {
  score: number;
  reasons: MatchReason[];
}

export function computeMatchScore(input: ScoringInput): ScoringOutput {
  const reasons: MatchReason[] = [];
  let score = 0;

  // Shared courses are matched by course code only. Course names are display
  // metadata because imports may disagree on wording.
  const bCourseCodes = new Set(input.studentBCourses.map((course) => course.code.toUpperCase()));
  for (const course of input.studentACourses) {
    if (bCourseCodes.has(course.code.toUpperCase())) {
      reasons.push({ type: "shared_course", courseCode: course.code, courseName: course.name });
      score += WEIGHTS.sharedCourse;
    }
  }

  // Shared interests
  const bInterests = new Set(input.studentBInterests);
  for (const interest of input.studentAInterests) {
    if (bInterests.has(interest)) {
      reasons.push({ type: "shared_interest", interest });
      score += WEIGHTS.sharedInterest;
    }
  }

  // Shared free time (exact day + window match — TODO [A]: consider overlap
  // instead of exact match once real timetable data exists)
  const bSlots = new Set(input.studentBFreeSlots.map((s) => `${s.day}|${s.window}`));
  for (const slot of input.studentAFreeSlots) {
    if (bSlots.has(`${slot.day}|${slot.window}`)) {
      reasons.push({ type: "shared_free_time", day: slot.day, window: slot.window });
      score += WEIGHTS.sharedFreeTime;
    }
  }

  // Sort most significant first, then cap at 100.
  reasons.sort((a, b) => weightOf(b) - weightOf(a));
  return { score: Math.min(100, score), reasons };
}

function weightOf(reason: MatchReason): number {
  if (reason.type === "shared_course") return WEIGHTS.sharedCourse;
  if (reason.type === "shared_interest") return WEIGHTS.sharedInterest;
  return WEIGHTS.sharedFreeTime;
}
