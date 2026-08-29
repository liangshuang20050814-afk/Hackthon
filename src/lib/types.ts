// [Owner: A] Shared types. This is the contract other people's UI code
// (B's classmate cards, C's chat/event lists, D's profile page) imports
// from — treat MatchResult / MatchReason as stable once B/C start building
// against it. See ARCHITECTURE.md "The contract that matters most".

export interface MatchReason {
  type: "shared_course" | "shared_interest" | "shared_free_time";
  // shared_course
  courseCode?: string;
  courseName?: string;
  // shared_interest
  interest?: string;
  // shared_free_time
  day?: string; // e.g. "Wed"
  window?: string; // e.g. "14:00-16:00"
}

export interface MatchResult {
  studentId: string;
  score: number; // 0-100
  reasons: MatchReason[]; // ordered, most significant first
  aiSummary: string; // Claude-generated 1-2 sentence explanation
}

export interface StudentSummary {
  id: string;
  name: string;
  avatarUrl: string | null;
  faculty: string;
  yearOfStudy: number;
  bio?: string | null;
  major?: string | null;
  mbti?: string | null;
  interests?: string[];
}
