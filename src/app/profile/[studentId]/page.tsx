// [Owner: D] SHARED page — A links here from match cards, B links here from
// the classmates list. Coordinate the data shape with A (student + courses
// + interests, matching src/lib/types.ts StudentSummary) before changing
// this file's props.
import { db } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import { notFound } from "next/navigation";

export default async function ProfilePage({ params }: { params: { studentId: string } }) {
  const student = await db.student.findUnique({
    where: { id: params.studentId },
    include: { interests: true, enrollments: { include: { course: true } } },
  });

  if (!student) notFound();

  return (
    <main className="flex flex-col gap-4 p-6">
      <img
        src={student.avatarUrl ?? "/avatars/placeholder.png"}
        alt={student.name}
        className="h-24 w-24 rounded-full object-cover"
      />
      <h1 className="text-xl font-bold">{student.name}</h1>
      <p className="text-gray-600">
        {student.faculty} · Year {student.yearOfStudy}
      </p>
      {student.bio && <p>{student.bio}</p>}

      <Card>
        <h2 className="mb-2 font-semibold">Courses</h2>
        <ul className="list-inside list-disc">
          {student.enrollments.map((e) => (
            <li key={e.id}>{e.course.code} — {e.course.name}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="mb-2 font-semibold">Interests</h2>
        <div className="flex flex-wrap gap-2">
          {student.interests.map((i) => (
            <span key={i.id} className="rounded-full bg-brand-light px-3 py-1 text-sm text-brand-dark">
              {i.label}
            </span>
          ))}
        </div>
      </Card>
    </main>
  );
}
