// [Owner: B] Lists students who share at least one course with the current
// user, then links into D's shared profile page. This is the second half of
// the schedule flow (manual entry -> ICS parse -> THIS -> profile).
import { db } from "@/lib/db";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getCurrentStudentId } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

export default async function ClassmatesPage() {
  const currentStudentId = getCurrentStudentId();
  const me = await db.student.findUnique({
    where: { id: currentStudentId },
    include: { enrollments: true },
  });

  const myCourseIds = me?.enrollments.map((e) => e.courseId) ?? [];

  const classmates = await db.student.findMany({
    where: {
      id: { not: currentStudentId },
      enrollments: { some: { courseId: { in: myCourseIds } } },
    },
    include: { enrollments: { include: { course: true } } },
  });

  const results = classmates
    .map((student) => {
      const sharedById = new Map(
        student.enrollments
          .filter((enrollment) => myCourseIds.includes(enrollment.courseId))
          .map((enrollment) => [enrollment.courseId, enrollment.course]),
      );
      return { student, sharedCourses: [...sharedById.values()] };
    })
    .sort((a, b) => b.sharedCourses.length - a.sharedCourses.length || a.student.name.localeCompare(b.student.name));

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 p-4 sm:p-6">
      <div>
        <Link href="/schedule" className="text-sm font-medium text-brand hover:underline">← Back to timetable</Link>
        <h1 className="mt-2 text-2xl font-bold">Your classmates</h1>
        <p className="mt-1 text-sm text-gray-600">People who share at least one course with you.</p>
      </div>
      {myCourseIds.length === 0 && <Card><p className="font-medium">Add classes before looking for classmates.</p></Card>}
      {myCourseIds.length > 0 && results.length === 0 && <Card><p className="font-medium">No classmates found yet.</p><p className="mt-1 text-sm text-gray-600">More seeded students can appear here without any UI changes.</p></Card>}
      {results.map(({ student, sharedCourses }) => (
        <Link key={student.id} href={`/profile/${student.id}`} className="rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
          <Card className="transition-shadow hover:shadow-md">
            <div className="flex items-center gap-3">
              <img src={student.avatarUrl ?? "/avatars/placeholder.png"} alt="" className="h-12 w-12 rounded-full bg-gray-100 object-cover" />
              <div className="min-w-0 flex-1"><p className="font-semibold">{student.name}</p><p className="text-sm text-gray-600">{student.faculty} · Year {student.yearOfStudy}</p></div>
              <span className="text-sm font-medium text-brand">View profile →</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {sharedCourses.map((course) => <span key={course.id} className="rounded-full bg-brand-light px-3 py-1 text-xs font-medium text-brand-dark">{course.code}</span>)}
            </div>
            <p className="mt-2 text-xs text-gray-500">{sharedCourses.length} shared {sharedCourses.length === 1 ? "course" : "courses"}</p>
          </Card>
        </Link>
      ))}
    </main>
  );
}
