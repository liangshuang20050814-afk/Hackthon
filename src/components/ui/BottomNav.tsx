"use client";

// [Owner: D] Root-level tab bar linking the 4 feature areas. Wraps every
// page via src/app/layout.tsx. Uses <Link> (real navigation, not onClick +
// router.push) so it works without JS and is keyboard/screen-reader native.
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/schedule", label: "Schedule" }, // [B]
  { href: "/matches", label: "Matches" }, // [A]
  { href: "/chat", label: "Chat" }, // [C]
  { href: "/events", label: "Events" }, // [C]
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-gray-200 bg-white py-2"
    >
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`px-3 py-1 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${
              active ? "text-brand" : "text-gray-500"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
