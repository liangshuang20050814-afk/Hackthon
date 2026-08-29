// [Owner: D] GET /api/students/:id -> single student, used by TopNav for
// the avatar+name button (lightweight, no courses/enrollments needed there).
// PATCH /api/students/:id -> updates a profile from src/app/profile/edit,
// and completes the account onboarding creates at POST /api/auth/signup.
// Both handlers strip passwordHash before responding — see the schema
// comment on Student.passwordHash for why.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(_request: Request, { params }: { params: { studentId: string } }) {
  const student = await db.student.findUnique({
    where: { id: params.studentId },
    include: { interests: true, enrollments: { include: { course: true } } },
  });
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { passwordHash, ...safe } = student;
  return NextResponse.json(safe);
}

export async function PATCH(request: Request, { params }: { params: { studentId: string } }) {
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

  // Same as POST /api/students: Interest.label has no unique constraint, so
  // resolve each label to an existing row (or create one) before connecting.
  const interestIds: string[] = [];
  for (const label of interests ?? []) {
    const existing = await db.interest.findFirst({ where: { label } });
    interestIds.push(existing ? existing.id : (await db.interest.create({ data: { label } })).id);
  }

  const student = await db.student.update({
    where: { id: params.studentId },
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
      // `set` first clears existing links, then `connect` re-adds the
      // current selection — handles both newly-picked and removed
      // interests in one write instead of diffing client-side.
      interests: { set: [], connect: interestIds.map((id) => ({ id })) },
    },
  });

  const { passwordHash: _hash, ...safe } = student;
  return NextResponse.json(safe);
}
