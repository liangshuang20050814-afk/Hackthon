"use client";

// [Owner: D] Root-level tab bar linking the 4 feature areas — lives in a
// sticky header instead of a floating bottom bar. Wraps every page via
// src/app/layout.tsx (formerly BottomNav.tsx; renamed when the nav moved
// to the top). Uses <Link> (real navigation, not onClick + router.push) so
// it works without JS and is keyboard/screen-reader native.
//
// Layout: logo + nav tabs grouped on the left, the current-user
// avatar+name button pinned on the right — standard desktop app header
// convention. The identity behind that button comes from a
// unimatch_student_id cookie set at sign-up (see lib/profileForm.ts),
// falling back to the seed placeholder on a fresh browser; there's no real
// session yet.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { StudentAvatar } from "./StudentAvatar";
import { getCurrentStudentIdClient } from "@/lib/profileForm";

const TABS = [
  { href: "/schedule", label: "Timetable" }, // [B]
  { href: "/matches", label: "Matches" }, // [A]
  { href: "/chat", label: "Chat" }, // [C]
  { href: "/events", label: "Events" }, // [C]
];

function CurrentUserButton() {
  const [user, setUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/students/${getCurrentStudentIdClient()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setUser({ name: data.name, avatarUrl: data.avatarUrl });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link
      href="/profile/edit"
      aria-label={user ? `Edit your profile, ${user.name}` : "Edit your profile"}
      className="flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:pr-3"
    >
      <StudentAvatar name={user?.name ?? "Profile"} avatarUrl={user?.avatarUrl} size="xs" />
      <span className="hidden text-sm font-semibold text-ink sm:inline">{user?.name ?? "Profile"}</span>
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();

  // Pre-auth / onboarding screens: no feature tabs to jump to yet.
  if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 shadow-soft backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-6">
          <Link
            href="/matches"
            aria-label="UniSoul home"
            className="flex shrink-0 items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <Logo size={32} />
          </Link>

          <nav
            aria-label="Primary"
            className="flex min-w-0 gap-1 overflow-x-auto rounded-full bg-brand-50 p-1"
          >
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-4 sm:text-sm ${
                    active
                      ? "bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-glass"
                      : "text-ink-muted hover:text-brand-700"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <CurrentUserButton />
      </div>
    </header>
  );
}
