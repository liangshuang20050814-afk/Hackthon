import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { db } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/demo-user";

export const dynamic = "force-dynamic";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function ClassClassmatesPage({ params }: { params: { enrollmentId: string } }) {
  const currentStudentId = getCurrentStudentId();
  const enrollment = await db.enrollment.findFirst({
    where: { id: params.enrollmentId, studentId: currentStudentId },
    include: { course: true },
  });

  if (!enrollment) notFound();

  const classmates = await db.student.findMany({
    where: {
      id: { not: currentStudentId },
      enrollments: {
        some: {
          courseId: enrollment.courseId,
          dayOfWeek: enrollment.dayOfWeek,
          startTime: enrollment.startTime,
          endTime: enrollment.endTime,
        },
      },
    },
    include: { interests: true },
    orderBy: { name: "asc" },
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/schedule" className="text-sm font-semibold text-brand-700 hover:underline">← Back to timetable</Link>

      <section className="mt-5 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-soft sm:p-7">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Classmates</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">{enrollment.course.code}</h1>
        <p className="mt-1 text-ink-muted">{enrollment.course.name}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-white px-3 py-1.5 text-ink shadow-sm">{DAY_LABELS[enrollment.dayOfWeek]}</span>
          <span className="rounded-full bg-white px-3 py-1.5 text-ink shadow-sm">{enrollment.startTime}–{enrollment.endTime}</span>
          {enrollment.location && <span className="rounded-full bg-white px-3 py-1.5 text-ink shadow-sm">{enrollment.location}</span>}
        </div>
      </section>

      <div className="mt-7 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">People in this class</h2>
          <p className="mt-1 text-sm text-ink-muted">{classmates.length} {classmates.length === 1 ? "classmate" : "classmates"} in the same weekly session</p>
        </div>
      </div>

      {classmates.length === 0 ? (
        <Card className="mt-4 text-center">
          <p className="font-semibold text-ink">No classmates found for this session yet.</p>
          <p className="mt-1 text-sm text-ink-muted">They will appear here as other students add the same class time.</p>
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {classmates.map((student) => (
            <Card key={student.id} className="flex h-full flex-col">
              <div className="flex items-center gap-3">
                {student.avatarUrl ? (
                  <img src={student.avatarUrl} alt="" className="h-14 w-14 rounded-full bg-brand-50 object-cover" />
                ) : (
                  <div aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 font-display text-lg font-bold text-white">
                    {student.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <h3 className="truncate font-display text-lg font-bold text-ink">{student.name}</h3>
                  <p className="truncate text-sm text-ink-muted">{student.major || student.faculty} · Year {student.yearOfStudy}</p>
                </div>
              </div>

              {student.bio && <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-muted">{student.bio}</p>}

              <div className="mt-3 flex flex-wrap gap-1.5">
                {student.mbti && <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{student.mbti}</span>}
                {student.interests.slice(0, 3).map((interest) => (
                  <span key={interest.id} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs text-brand-700">{interest.label}</span>
                ))}
              </div>

              <Link href={`/profile/${student.id}`} className="mt-4 inline-flex self-start rounded-full bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
                View profile
              </Link>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
