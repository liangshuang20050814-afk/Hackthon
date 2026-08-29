"use client";

// [Owner: D] Sign up — split out from /login (was a tab toggle on that
// page). Creates the account itself (POST /api/auth/signup, bcrypt-hashed
// password); onboarding (src/app/onboarding/page.tsx) fills in the rest
// of the profile a moment later on the same row.
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { setCurrentStudentIdCookie } from "@/lib/profileForm";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const confirmPassword = String(data.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error ?? "Could not create account.");
        return;
      }
      setCurrentStudentIdCookie(result.id);
      router.push(`/onboarding?name=${encodeURIComponent(name)}`);
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      {/* bg-white/40 overrides glass-surface's default /70 — more see-through
          than the rest of the app's glass surfaces on purpose, just for
          this card, since the shared .glass-surface class stays untouched
          for onboarding/edit-profile/etc. */}
      <div className="glass-surface flex w-full max-w-md flex-col gap-6 rounded-[2rem] border-white/40 bg-white/40 px-8 py-10">
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Field id="name" label="Full name" type="text" autoComplete="name" placeholder="Alex Chen" />
          <Field
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@uni.sydney.edu.au"
          />
          <Field id="password" label="Password" type="password" autoComplete="new-password" placeholder="••••••••" minLength={8} />
          <Field
            id="confirmPassword"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
          />

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting ? "Please wait..." : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Log in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
