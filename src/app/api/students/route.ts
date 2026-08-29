// [Owner: A] GET /api/students -> list of students with courses + interests.
// Used by B (classmates list) and C (chat/event attendee lookups).
//
// [Owner: D] POST /api/students -> creates the Student row from the
// onboarding wizard (src/app/onboarding/page.tsx). No auth/session exists
// yet, so this doesn't attach to a logged-in user — it just creates the
// row and hands back its id. `avatarUrl` is a data: URL generated client
// side (either a cropped upload or a rendered initials avatar) — SQLite
// stores it as plain TEXT same as any other string, and every existing
// <img src={avatarUrl}> callsite already works with it unmodified.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { NON_PLACEHOLDER_STUDENT_WHERE } from "@/lib/students/filters";

export async function GET() {
  const students = await db.student.findMany({
    where: NON_PLACEHOLDER_STUDENT_WHERE,
    include: { interests: true, enrollments: { include: { course: true } } },
  });
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, faculty, yearOfStudy, bio, interests, avatarUrl, major, birthday, gender, mbti } = body as {
    name?: string;
    faculty?: string;
    yearOfStudy?: number;
    bio?: string;
    interests?: string[];
    avatarUrl?: string;
    major?: string;
    birthday?: string;
    gender?: string;
    mbti?: string;
  };

  if (!name || !faculty || !yearOfStudy) {
    return NextResponse.json({ error: "name, faculty, and yearOfStudy are required" }, { status: 400 });
  }

  // Interest.label has no unique constraint in the schema, so connectOrCreate
  // isn't available — resolve each label to an existing row (or create one)
  // before connecting, to avoid seeding duplicate "Gaming" / "Gaming" rows.
  const interestIds: string[] = [];
  for (const label of interests ?? []) {
    const existing = await db.interest.findFirst({ where: { label } });
    interestIds.push(existing ? existing.id : (await db.interest.create({ data: { label } })).id);
  }

  const student = await db.student.create({
    data: {
      name,
      faculty,
      yearOfStudy,
      bio: bio || null,
      avatarUrl: avatarUrl || null,
      major: major || null,
      birthday: birthday ? new Date(birthday) : null,
      gender: gender || null,
      mbti: mbti || null,
      interests: { connect: interestIds.map((id) => ({ id })) },
    },
  });

  return NextResponse.json(student, { status: 201 });
}
