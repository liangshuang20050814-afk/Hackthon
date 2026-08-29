"use client";

// [Owner: D] Entry point of the app — email/password login + sign up, in
// one screen with a tab switch. No real auth backend exists yet (the
// Student model has no email/password columns), so submitting either form
// just continues into the app; wiring real auth is a backend task for A,
// not a D/design concern.
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

type Mode = "login" | "signup";

function Field({
  id,
  label,
  type,
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        className="rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        placeholder={placeholder}
      />
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const router = useRouter();

  // TODO [A]: replace with a real request once Student has email/password
  // columns. For the demo: existing users go straight into the app, new
  // users go through profile setup (src/app/onboarding/page.tsx) first.
  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode === "signup") {
      const name = new FormData(e.currentTarget).get("name");
      const query = name ? `?name=${encodeURIComponent(name.toString())}` : "";
      router.push(`/onboarding${query}`);
    } else {
      router.push("/matches");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="glass-surface flex flex-col gap-6 rounded-[2rem] px-8 py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <Logo />
          <h1 className="font-display text-xl font-bold text-ink">UniMatch</h1>
          <p className="text-sm text-ink-muted">Find and connect with classmates at USYD.</p>
        </div>

        <div
          role="tablist"
          aria-label="Login or sign up"
          className="grid grid-cols-2 gap-1 rounded-full bg-brand-50 p-1"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            onClick={() => setMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              mode === "login" ? "bg-white text-brand-700 shadow-soft" : "text-ink-muted"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "signup"}
            onClick={() => setMode("signup")}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              mode === "signup" ? "bg-white text-brand-700 shadow-soft" : "text-ink-muted"
            }`}
          >
            Sign up
          </button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <Field id="name" label="Full name" type="text" autoComplete="name" placeholder="Alex Chen" />
          )}
          <Field
            id="email"
            label="University email"
            type="email"
            autoComplete="email"
            placeholder="you@uni.sydney.edu.au"
          />
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium text-ink">
                Password
              </label>
              {mode === "login" && (
                <a href="#" className="text-xs font-medium text-brand-700 hover:underline">
                  Forgot password?
                </a>
              )}
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={8}
              className="rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              placeholder="••••••••"
            />
          </div>
          {mode === "signup" && (
            <Field
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
            />
          )}

          <Button type="submit" className="mt-2">
            {mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>

        <p className="text-center text-sm text-ink-muted">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-semibold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
