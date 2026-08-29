// Server-side current user adapter. Onboarding stores the created Student id
// in a lightweight cookie; server routes/pages read it here and fall back to
// the seeded demo user for a fresh browser.
import { cookies } from "next/headers";
import { DEMO_STUDENT_ID } from "@/lib/demo-user";
import { CURRENT_STUDENT_COOKIE } from "@/lib/profileForm";

export function getCurrentStudentId(): string {
  return cookies().get(CURRENT_STUDENT_COOKIE)?.value || DEMO_STUDENT_ID;
}
