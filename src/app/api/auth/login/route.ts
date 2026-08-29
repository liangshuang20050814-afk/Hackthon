// [Owner: D] POST /api/auth/login -> verifies email + password against the
// stored password hash. Deliberately returns the same generic error whether
// the email doesn't exist or the password is wrong — don't let the error
// message confirm which emails have accounts. Seed students have no
// passwordHash at all, so they can never be logged into (expected: they
// represent other people, not accounts you own).
import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db";

const INVALID_CREDENTIALS = { error: "That email or password doesn't match an account." };

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const student = await db.student.findUnique({ where: { email: normalizedEmail } });

  if (!student || !student.passwordHash) {
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
  }

  const matches = await verifyPassword(password, student.passwordHash);
  if (!matches) {
    return NextResponse.json(INVALID_CREDENTIALS, { status: 401 });
  }

  return NextResponse.json({ id: student.id });
}
