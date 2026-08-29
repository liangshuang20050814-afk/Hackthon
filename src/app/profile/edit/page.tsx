// [Owner: D] Edit an existing profile — reachable from the avatar+name
// button in TopNav. Unlike onboarding (a one-time wizard for brand-new
// accounts), this is a single scrollable form pre-filled with the current
// values, since editing benefits from seeing everything at once rather
// than re-clicking through steps.
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CURRENT_STUDENT_COOKIE, CURRENT_STUDENT_ID } from "@/lib/profileForm";
import { EditProfileForm } from "./EditProfileForm";

export default async function EditProfilePage() {
  const currentId = cookies().get(CURRENT_STUDENT_COOKIE)?.value || CURRENT_STUDENT_ID;
  // The cookie can outlive the row it points to (e.g. a reset dev database
  // while a browser still holds an old cookie) — fall back to the seed
  // placeholder rather than hard 404ing in that case.
  const student =
    (await db.student.findUnique({ where: { id: currentId }, include: { interests: true } })) ??
    (await db.student.findUnique({ where: { id: CURRENT_STUDENT_ID }, include: { interests: true } }));

  if (!student) notFound();

  return (
    <main className="mx-auto flex max-w-6xl flex-col px-6 py-10">
      <EditProfileForm
        student={{
          id: student.id,
          name: student.name,
          avatarUrl: student.avatarUrl,
          faculty: student.faculty,
          yearOfStudy: student.yearOfStudy,
          major: student.major ?? "",
          birthday: student.birthday ? student.birthday.toISOString().slice(0, 10) : "",
          gender: student.gender,
          mbti: student.mbti ?? "",
          bio: student.bio ?? "",
          interests: student.interests.map((i) => i.label),
        }}
      />
    </main>
  );
}
