// [Owner: A] Explainable scoring algorithm — this is the feature that
// differentiates the app from a generic dating-app clone. Never return a
// bare number: every point of `score` must trace back to a MatchReason.
import type { MatchReason } from "@/lib/types";

const CATEGORY_WEIGHTS = {
  courses: 45,
  interests: 35,
  freeTime: 20,
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

  // Shared courses are matched by course code only. Course names are display
  // metadata because imports may disagree on wording.
  const bCourseCodes = new Set(input.studentBCourses.map((course) => course.code.toUpperCase()));
  const sharedCourses: MatchReason[] = [];
  for (const course of input.studentACourses) {
    if (bCourseCodes.has(course.code.toUpperCase())) {
      sharedCourses.push({ type: "shared_course", courseCode: course.code, courseName: course.name });
    }
  }

  // Shared interests
  const bInterests = new Set(input.studentBInterests);
  const sharedInterests: MatchReason[] = [];
  for (const interest of input.studentAInterests) {
    if (bInterests.has(interest)) {
      sharedInterests.push({ type: "shared_interest", interest });
    }
  }

  // Shared free time is capped as one category so empty timetable windows do
  // not swamp course/profile mismatch and force every match to 100%.
  const bSlots = new Set(input.studentBFreeSlots.map((s) => `${s.day}|${s.window}`));
  const sharedFreeSlots: MatchReason[] = [];
  for (const slot of input.studentAFreeSlots) {
    if (bSlots.has(`${slot.day}|${slot.window}`)) {
      sharedFreeSlots.push({ type: "shared_free_time", day: slot.day, window: slot.window });
    }
  }

  reasons.push(...sharedCourses, ...sharedInterests, ...sharedFreeSlots.slice(0, 3));
  reasons.sort((a, b) => weightOf(b) - weightOf(a));

  const courseDenominator = Math.max(input.studentACourses.length, input.studentBCourses.length, 1);
  const interestDenominator = Math.max(input.studentAInterests.length, input.studentBInterests.length, 1);
  const courseScore = CATEGORY_WEIGHTS.courses * (sharedCourses.length / courseDenominator);
  const interestScore = CATEGORY_WEIGHTS.interests * (sharedInterests.length / interestDenominator);
  const freeTimeScore = CATEGORY_WEIGHTS.freeTime * Math.min(1, sharedFreeSlots.length / 3);

  return { score: Math.min(100, Math.round(courseScore + interestScore + freeTimeScore)), reasons };
}

function weightOf(reason: MatchReason): number {
  if (reason.type === "shared_course") return CATEGORY_WEIGHTS.courses;
  if (reason.type === "shared_interest") return CATEGORY_WEIGHTS.interests;
  return CATEGORY_WEIGHTS.freeTime;
}
