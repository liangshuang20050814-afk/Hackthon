// [Owner: D] Shared constants + browser-only helpers for the profile forms
// (src/app/onboarding/page.tsx and src/app/profile/edit/page.tsx). Keeping
// these in one place means the two forms can't drift out of sync on what
// faculties/interests/etc. are offered.
//
// The helpers here (fileToSquareDataUrl, generateInitialsAvatar) use
// document/Image/canvas — only ever import this from "use client" code.

export const FACULTIES = [
  "Architecture, Design & Planning",
  "Arts & Social Sciences",
  "Business",
  "Conservatorium of Music",
  "Education & Social Work",
  "Engineering",
  "Law",
  "Medicine & Health",
  "Science",
];

export const YEARS = [
  { label: "1st year", value: 1 },
  { label: "2nd year", value: 2 },
  { label: "3rd year", value: 3 },
  { label: "4th year", value: 4 },
  { label: "5th+ year", value: 5 },
  { label: "Postgrad", value: 6 },
];

export const GENDERS = ["Woman", "Man", "Non-binary", "Prefer not to say"];

export const MBTI_TYPES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
];

export const AVATAR_SWATCHES = [
  { id: "indigo", from: "from-brand-400", to: "to-brand-600", hexFrom: "#8B7BF0", hexTo: "#5B4FE0" },
  { id: "rose", from: "from-rose-400", to: "to-rose-600", hexFrom: "#FB7185", hexTo: "#E11D48" },
  { id: "amber", from: "from-amber-400", to: "to-amber-600", hexFrom: "#FBBF24", hexTo: "#D97706" },
  { id: "emerald", from: "from-emerald-400", to: "to-emerald-600", hexFrom: "#34D399", hexTo: "#059669" },
  { id: "sky", from: "from-sky-400", to: "to-sky-600", hexFrom: "#38BDF8", hexTo: "#0284C7" },
  { id: "fuchsia", from: "from-fuchsia-400", to: "to-fuchsia-600", hexFrom: "#E879F9", hexTo: "#C026D3" },
];

export const INTERESTS = [
  "Coffee",
  "Gaming",
  "Hiking",
  "Travel",
  "Music",
  "Movies",
  "K-pop",
  "Art",
  "Books",
  "Photography",
  "Basketball",
  "Football",
  "Yoga",
  "Cooking",
  "Anime",
  "Board Games",
  "Startups",
  "Coding",
  "Volunteering",
  "Climbing",
  "Dance",
  "Fashion",
];

export const MIN_INTERESTS = 3;
export const BIO_MAX = 200;
export const AVATAR_SIZE = 320;

// No real auth/session exists yet. This mirrors the TODO in
// src/app/matches/page.tsx (A's CURRENT_STUDENT_ID) — both will be replaced
// by a real logged-in id once login (D) and session state (A) are wired
// together; kept as separate constants for now since neither owner should
// silently depend on the other's file.
export const CURRENT_STUDENT_ID = "demo-student-1";

// Lightweight stand-in for a real session: a plain (non-httpOnly) cookie
// set after a successful sign-up, so the rest of the app remembers "whoever
// this browser last created" instead of always showing the seed
// placeholder. This is NOT auth — nothing verifies it, and "Log in" with an
// existing email can't resolve to a specific student yet (Student has no
// email/password columns), so login intentionally leaves it untouched and
// just continues as whoever this browser last signed up as (or the demo
// placeholder, on a fresh browser). Readable server-side too via
// `cookies().get(CURRENT_STUDENT_COOKIE)` (next/headers).
export const CURRENT_STUDENT_COOKIE = "unimatch_student_id";

export function setCurrentStudentIdCookie(id: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${CURRENT_STUDENT_COOKIE}=${encodeURIComponent(id)}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function getCurrentStudentIdClient(): string {
  if (typeof document === "undefined") return CURRENT_STUDENT_ID;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CURRENT_STUDENT_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : CURRENT_STUDENT_ID;
}

export function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// Center-crops the uploaded photo to a square and downsizes it, so what we
// store (and later send to the API) is a small, consistent data: URL
// instead of an arbitrarily large original file.
export function fileToSquareDataUrl(file: File, size = AVATAR_SIZE): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      const side = Math.min(img.width, img.height);
      const sx = (img.width - side) / 2;
      const sy = (img.height - side) / 2;
      ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
      URL.revokeObjectURL(objectUrl);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read image"));
    };
    img.src = objectUrl;
  });
}

// Fallback when no photo is uploaded: renders the same gradient + initials
// shown in the preview as a real image, so avatarUrl is never a dead value.
export function generateInitialsAvatar(name: string, hexFrom: string, hexTo: string, size = AVATAR_SIZE): string {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, hexFrom);
  gradient.addColorStop(1, hexTo);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 ${size * 0.4}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initialsOf(name), size / 2, size / 2 + size * 0.03);
  return canvas.toDataURL("image/png");
}
