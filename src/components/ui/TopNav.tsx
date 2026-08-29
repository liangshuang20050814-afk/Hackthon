"use client";

// [Owner: D] Root-level tab bar linking the 4 feature areas — lives in a
// sticky header instead of a floating bottom bar. Wraps every page via
// src/app/layout.tsx (formerly BottomNav.tsx; renamed when the nav moved
// to the top). Uses <Link> (real navigation, not onClick + router.push) so
// it works without JS and is keyboard/screen-reader native.
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const TABS = [
  { href: "/schedule", label: "Schedule" }, // [B]
  { href: "/matches", label: "Matches" }, // [A]
  { href: "/chat", label: "Chat" }, // [C]
  { href: "/events", label: "Events" }, // [C]
];

export function TopNav() {
  const pathname = usePathname();

  // Pre-auth / onboarding screens: no feature tabs to jump to yet.
  if (pathname === "/login" || pathname === "/onboarding") return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 shadow-soft backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-3 py-3 sm:gap-4 sm:px-6">
        <Link
          href="/matches"
          className="flex shrink-0 items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Logo size={28} />
          <span className="hidden font-display text-base font-bold text-ink sm:inline">UniMatch</span>
        </Link>

        <nav
          aria-label="Primary"
          className="flex min-w-0 flex-1 justify-end gap-1 overflow-x-auto rounded-full bg-brand-50 p-1"
        >
          {TABS.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-4 sm:text-sm ${
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
    </header>
  );
}
