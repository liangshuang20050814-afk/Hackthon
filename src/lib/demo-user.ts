// Temporary identity adapter for the hackathon demo.
// D can replace this with a cookie/session lookup without changing B's routes.
export const DEMO_STUDENT_ID = "demo-student-1";

export function getCurrentStudentId(): string {
  return DEMO_STUDENT_ID;
}
