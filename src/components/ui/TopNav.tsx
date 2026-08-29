"use client";

// [Owner: D] Root-level tab bar linking the 4 feature areas — lives in a
// sticky header instead of a floating bottom bar. Wraps every page via
// src/app/layout.tsx (formerly BottomNav.tsx; renamed when the nav moved
// to the top). Uses <Link> (real navigation, not onClick + router.push) so
// it works without JS and is keyboard/screen-reader native.
//
// Layout: logo dead center, two tabs flanking it on each side, the
// current-user avatar+name button pinned on the far right. Split across
// two <nav> landmarks (distinct aria-labels, not the same one twice) since
// the tab list is no longer one contiguous group in the DOM. The identity
// behind the profile button comes from a unimatch_student_id cookie set at
// sign-up (see lib/profileForm.ts), falling back to the seed placeholder
// on a fresh browser; there's no real session yet.
import {
  CURRENT_STUDENT_ID,
  PROFILE_UPDATED_EVENT,
  getCurrentStudentIdClient,
  type ProfileUpdatedDetail,
} from "@/lib/profileForm";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { StudentAvatar } from "./StudentAvatar";

const TABS = [
  { href: "/schedule", label: "Timetable" }, // [B]
  { href: "/matches", label: "Matches" }, // [A]
  { href: "/chat", label: "Chat" }, // [C]
  { href: "/events", label: "Events" }, // [C]
];
const LEFT_TABS = TABS.slice(0, 2);
const RIGHT_TABS = TABS.slice(2);

// Plain text links, not boxed pill buttons — the current page gets a
// permanent underline, everything else only highlights (color + underline)
// on hover/focus.
//
// Every tab gets the same min-width (wide enough for the longest label,
// "Timetable") and centers its text inside it. Without that the two sides
// of the logo can't mirror each other — the left pair is ~250px of text
// and the right pair only ~180px, so the whole cluster sits off-center
// however the columns are aligned. Equal slots make the layout symmetric
// about the logo by construction. The underline still tracks the word, not
// the slot, since it's drawn on the text run.
function TabLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`shrink-0 whitespace-nowrap px-1.5 py-2 text-center text-[0.9375rem] font-bold uppercase tracking-[0.18em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:min-w-[8.5rem] ${
        active ? "text-brand-700" : "text-ink-muted hover:text-brand-700"
      }`}
    >
      <span className={`nav-tab-label ${active ? "nav-tab-label--active" : ""}`}>{label}</span>
    </Link>
  );
}

function CurrentUserButton() {
  const [user, setUser] = useState<{ name: string; avatarUrl: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    // Mirror the fallback in profile/edit/page.tsx: the cookie can outlive
    // the row it points to (e.g. a reset dev database), so a 404 here
    // retries against the seed placeholder instead of leaving the button
    // stuck on its generic "Profile" state while every other page showing
    // "the current user" has already fallen back and moved on.
    async function loadUser() {
      const cookiedId = getCurrentStudentIdClient();
      let res = await fetch(`/api/students/${cookiedId}`);
      if (!res.ok && cookiedId !== CURRENT_STUDENT_ID) {
        res = await fetch(`/api/students/${CURRENT_STUDENT_ID}`);
      }
      if (!res.ok) return null;
      return res.json();
    }
    loadUser()
      .then((data) => {
        if (!cancelled && data) setUser({ name: data.name, avatarUrl: data.avatarUrl });
      })
      .catch(() => {});

    // Saving on /profile/edit doesn't navigate, so this component never
    // remounts and would otherwise keep showing the pre-save avatar/name
    // until a hard reload. The edit form hands us the saved values, so
    // there's nothing to re-fetch.
    function onProfileUpdated(event: Event) {
      const detail = (event as CustomEvent<ProfileUpdatedDetail>).detail;
      if (detail) setUser({ name: detail.name, avatarUrl: detail.avatarUrl });
    }
    window.addEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(PROFILE_UPDATED_EVENT, onProfileUpdated);
    };
  }, []);

  return (
    <Link
      href="/profile/edit"
      aria-label={user ? `Edit your profile, ${user.name}` : "Edit your profile"}
      className="flex min-w-0 items-center gap-2 rounded-full px-1 py-1 transition-colors hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:px-3"
    >
      <span className="nav-avatar-orbit" aria-hidden="true">
        <StudentAvatar
          name={user?.name ?? "Profile"}
          avatarUrl={user?.avatarUrl}
          size="sm"
          className="ring-1 ring-white/80"
        />
      </span>
      {/* Truncates rather than pushing: the tab slots are fixed-width, so
          without this a long name grows the row past the grid column and
          the nav's overflow-x-auto turns into a visible scrollbar. */}
      <span className="hidden truncate text-base font-semibold text-ink sm:inline">{user?.name ?? "Profile"}</span>
    </Link>
  );
}

export function TopNav() {
  const pathname = usePathname();

  // Pre-auth / onboarding screens: no feature tabs to jump to yet.
  if (pathname === "/login" || pathname === "/signup" || pathname === "/onboarding") return null;

  // backdrop-blur belongs on the header itself, not on the galaxy layer:
  // the galaxy is a child, so it paints *over* the blurred backdrop and
  // would cancel the frosting if it carried the filter. Its own colours are
  // translucent so page content stays visible through the bar.
  return (
    <header className="sticky top-0 z-50 overflow-hidden border-b border-white/50 bg-white/30 shadow-soft backdrop-blur-2xl backdrop-saturate-150">
      {/* Decorative layers, behind the content (which is z-10) and inert to
          the pointer. The bottom beam replaces the old flat border. */}
      <div className="nav-galaxy" aria-hidden="true">
        <span className="nav-blob nav-blob-1" />
        <span className="nav-blob nav-blob-2" />
        <span className="nav-blob nav-blob-3" />
        <span className="nav-milkyway" />
        <span className="nav-orbit nav-orbit-1" />
        <span className="nav-orbit nav-orbit-2" />
        <span className="nav-orbit nav-orbit-3" />
        <span className="nav-stars nav-stars-1" />
        <span className="nav-stars nav-stars-2" />
        <span className="nav-meteor nav-meteor-1" />
        <span className="nav-meteor nav-meteor-2" />
        <span className="nav-meteor nav-meteor-3" />
        <span className="nav-meteor nav-meteor-4" />
      </div>
      <div className="nav-beam" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-3 py-3 sm:px-6">
        <nav aria-label="Primary" className="flex min-w-0 items-center justify-end gap-6 overflow-x-auto sm:overflow-x-visible justify-self-end">
          {LEFT_TABS.map((tab) => (
            <TabLink key={tab.href} href={tab.href} label={tab.label} active={pathname.startsWith(tab.href)} />
          ))}
        </nav>

        <Link
          href="/matches"
          aria-label="UniSoul home"
          className="nav-logo flex shrink-0 items-center justify-self-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          <Logo size={80} />
        </Link>

        {/* No justify-self-end here — this column should stretch to fill
            its grid cell so the tabs can hug the logo (justify-between's
            start edge) while the profile button still lands on the far
            right (justify-between's end edge), instead of both bunching up
            together away from the logo. */}
        {/* gap-8, not wider: the two fixed 8.5rem tab slots plus the profile
            button already fill this grid column almost exactly, and a bigger
            gap here pushes the name into its own truncation. */}
        <div className="flex min-w-0 items-center justify-between gap-6 sm:gap-8">
          <nav aria-label="More" className="flex min-w-0 items-center gap-6 overflow-x-auto sm:overflow-x-visible">
            {RIGHT_TABS.map((tab) => (
              <TabLink key={tab.href} href={tab.href} label={tab.label} active={pathname.startsWith(tab.href)} />
            ))}
          </nav>

          <CurrentUserButton />
        </div>
      </div>
    </header>
  );
}
