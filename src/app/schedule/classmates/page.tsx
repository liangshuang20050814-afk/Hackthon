// [Owner: B] Lists students who share at least one course with the current
// user, then links into D's shared profile page. This is the second half of
// the schedule flow (manual entry -> ICS parse -> THIS -> profile).
import { db } from "@/lib/db";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

// TODO [B]: use the real logged-in student id once login (D) exists.
const CURRENT_STUDENT_ID = "demo-student-1";

export default async function ClassmatesPage() {
  const me = await db.student.findUnique({
    where: { id: CURRENT_STUDENT_ID },
    include: { enrollments: true },
  });

  const myCourseIds = me?.enrollments.map((e) => e.courseId) ?? [];

  const classmates = await db.student.findMany({
    where: {
      id: { not: CURRENT_STUDENT_ID },
      enrollments: { some: { courseId: { in: myCourseIds } } },
    },
    include: { enrollments: { include: { course: true } } },
  });

  return (
    <main className="flex flex-col gap-3 p-6">
      <h1 className="text-xl font-bold">Classmates</h1>
      {classmates.map((student) => (
        <Link key={student.id} href={`/profile/${student.id}`}>
          <Card>
            <p className="font-semibold">{student.name}</p>
            <p className="text-sm text-gray-600">
              Shares: {student.enrollments.map((e) => e.course.code).join(", ")}
            </p>
          </Card>
        </Link>
      ))}
    </main>
  );
}
