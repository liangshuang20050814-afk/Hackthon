// [Owner: D] SHARED page — A links here from match cards, B links here from
// the classmates list. Coordinate the data shape with A (student + courses
// + interests, matching src/lib/types.ts StudentSummary) before changing
// this file's props.
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { StartConversationButton } from "@/components/chat/StartConversationButton";
import { notFound } from "next/navigation";
import { StudentAvatar } from "@/components/ui/StudentAvatar";

function ageFrom(birthday: Date | null): number | null {
  if (!birthday) return null;
  const diffMs = Date.now() - birthday.getTime();
  return Math.floor(diffMs / (365.25 * 24 * 60 * 60 * 1000));
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
      {label}
    </span>
  );
}

export default async function ProfilePage({ params }: { params: { studentId: string } }) {
  const student = await db.student.findUnique({
    where: { id: params.studentId },
    include: { interests: true, enrollments: { include: { course: true } } },
  });

  if (!student) notFound();

  const age = ageFrom(student.birthday);
  const badges = [
    age !== null && `${age} y/o`,
    student.gender,
    student.mbti,
  ].filter((v): v is string => Boolean(v));

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8 sm:px-6">
      <div className="glass-surface flex flex-col items-center gap-3 rounded-[2rem] px-8 py-10 text-center">
        <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} size="xl" className="shadow-glass ring-4 ring-white" />
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{student.name}</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {student.faculty} · Year {student.yearOfStudy}
            {student.major && ` · ${student.major}`}
          </p>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {badges.map((label) => (
              <Badge key={label} label={label} />
            ))}
          </div>
        )}

        {student.bio && <p className="max-w-md text-sm text-ink-muted">{student.bio}</p>}

        <StartConversationButton studentId={student.id} />
      </div>

      <Card>
        <h2 className="mb-3 font-display font-semibold text-ink">Interests</h2>
        {student.interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {student.interests.map((i) => (
              <span
                key={i.id}
                className="rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-3 py-1 text-sm font-medium text-white"
              >
                {i.label}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-muted">No interests added yet.</p>
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-display font-semibold text-ink">Courses</h2>
        {student.enrollments.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {student.enrollments.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm text-ink">
                <span className="rounded-md bg-brand-50 px-2 py-0.5 font-mono text-xs font-semibold text-brand-700">
                  {e.course.code}
                </span>
                {e.course.name}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-ink-muted">No courses added yet.</p>
        )}
      </Card>
    </main>
  );
}
