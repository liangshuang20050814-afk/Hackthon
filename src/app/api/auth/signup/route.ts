// [Owner: D] POST /api/auth/signup -> creates the account itself (name +
// email + hashed password). This is deliberately separate from the rest
// of the profile: faculty/yearOfStudy get real values a few seconds later
// when onboarding (src/app/onboarding/page.tsx) PATCHes this same row via
// /api/students/[studentId] — placeholders here just satisfy the schema's
// NOT NULL columns in between.
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const SALT_ROUNDS = 10;

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await db.student.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const student = await db.student.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      // Real values land moments later via onboarding's PATCH.
      faculty: "",
      yearOfStudy: 1,
    },
  });

  return NextResponse.json({ id: student.id }, { status: 201 });
}
