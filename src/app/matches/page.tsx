// [Owner: A] General matching discovery experience.
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
import { DEMO_STUDENT_ID } from "@/lib/demo-user";
import type { MatchResult, StudentSummary } from "@/lib/types";

type MatchWithStudent = MatchResult & { student: StudentSummary };
type Phase = "intro" | "searching" | "reveal" | "feedback";
type Decision = "request" | "pass";

const BLOCKS = [
  { label: "MBTI", className: "match-block--mbti" },
  { label: "Schedule", className: "match-block--schedule" },
  { label: "Major", className: "match-block--major" },
  { label: "Interests", className: "match-block--interest" },
];

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchWithStudent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("intro");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMatches() {
      try {
        const response = await fetch(`/api/matches?studentId=${DEMO_STUDENT_ID}&all=true`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("We could not load your matches. Please try again.");

        const candidates = (await response.json()) as MatchWithStudent[];
        if (!cancelled) setMatches(candidates);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "We could not load your matches.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMatches();
    return () => {
      cancelled = true;
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const currentMatch = matches[currentIndex] ?? null;

  function explore() {
    if (!currentMatch || phase !== "intro") return;
    setDecision(null);
    setPhase("searching");
    timerRef.current = window.setTimeout(() => setPhase("reveal"), 1450);
  }

  function makeDecision(nextDecision: Decision) {
    if (!currentMatch || phase !== "reveal") return;

    const storedKey = nextDecision === "request" ? "unimatch.requests" : "unimatch.passes";
    const existing = JSON.parse(window.localStorage.getItem(storedKey) ?? "[]") as string[];
    window.localStorage.setItem(storedKey, JSON.stringify(Array.from(new Set([...existing, currentMatch.studentId]))));

    setDecision(nextDecision);
    setPhase("feedback");
    timerRef.current = window.setTimeout(() => {
      setCurrentIndex((index) => (matches.length > 1 ? (index + 1) % matches.length : index));
      setDecision(null);
      if (nextDecision === "pass") {
        setPhase("searching");
        timerRef.current = window.setTimeout(() => setPhase("reveal"), 1450);
      } else {
        setPhase("intro");
      }
    }, 1250);
  }

  return (
    <main className="mx-auto min-h-[calc(100vh-5rem)] max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="match-stage relative isolate min-h-[640px] overflow-hidden rounded-[2rem] border border-white/70 bg-white/55 px-5 py-8 shadow-glass backdrop-blur-xl sm:min-h-[680px] sm:px-10 sm:py-10">
        <div aria-hidden="true" className="match-grid absolute inset-0 -z-20" />
        <div aria-hidden="true" className="match-stage-wash absolute inset-0 -z-10" />

        <header className="flex items-center justify-end">
          <div className="flex items-center gap-2" aria-label="Matching dimensions">
            {BLOCKS.map((block) => (
              <span key={block.label} className={`h-2.5 w-2.5 rounded-[3px] ${block.className}`} />
            ))}
          </div>
        </header>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} />}
        {!loading && !error && !currentMatch && <EmptyState />}

        {!loading && !error && currentMatch && phase === "intro" && (
          <IntroState onExplore={explore} />
        )}
        {!loading && !error && currentMatch && phase === "searching" && <SearchingState />}
        {!loading && !error && currentMatch && phase === "reveal" && (
          <CandidateReveal
            key={currentMatch.studentId}
            match={currentMatch}
            onRequest={() => makeDecision("request")}
            onPass={() => makeDecision("pass")}
          />
        )}
        {!loading && !error && currentMatch && phase === "feedback" && (
          <FeedbackState decision={decision} name={currentMatch.student.name} />
        )}
      </div>
    </main>
  );
}

function IntroState({ onExplore }: { onExplore: () => void }) {
  return (
    <section className="match-enter flex min-h-[540px] flex-col items-center justify-center text-center sm:min-h-[570px]">
      <BlockConstellation />
      <h1 className="mt-8 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-5xl">
        Want to find your best match?
      </h1>
      <p className="mt-4 max-w-lg text-sm leading-6 text-ink-muted sm:text-base">
        Bring your MBTI, schedule, major, and interests together to discover which overlap lights up first.
      </p>
      <Button onClick={onExplore} className="mt-8 min-w-36 px-8 py-3 text-base">
        Explore
      </Button>
    </section>
  );
}

function BlockConstellation({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`match-constellation ${compact ? "match-constellation--compact" : ""}`} aria-hidden="true">
      <div className="match-orbit match-orbit--outer" />
      <div className="match-orbit match-orbit--inner" />
      {BLOCKS.map((block, index) => (
        <div
          key={block.label}
          className={`match-block match-block-${index + 1} ${block.className}`}
          style={{ animationDelay: `${index * 120}ms` }}
        >
          {block.label}
        </div>
      ))}
      <div className="match-core"><span /></div>
    </div>
  );
}

function SearchingState() {
  return (
    <section className="match-enter flex min-h-[540px] flex-col items-center justify-center text-center sm:min-h-[570px]" aria-live="polite">
      <BlockConstellation compact />
      <h1 className="mt-8 font-display text-3xl font-bold text-ink sm:text-4xl">Finding the overlap that shines</h1>
      <p className="mt-3 text-sm text-ink-muted">Comparing courses, personality, major, and interests...</p>
      <div className="mt-6 flex gap-2" aria-hidden="true">
        <span className="match-search-dot" />
        <span className="match-search-dot [animation-delay:160ms]" />
        <span className="match-search-dot [animation-delay:320ms]" />
      </div>
    </section>
  );
}

function CandidateReveal({
  match,
  onRequest,
  onPass,
}: {
  match: MatchWithStudent;
  onRequest: () => void;
  onPass: () => void;
}) {
  const profile = match.student;

  return (
    <section className="match-reveal mx-auto mt-8 max-w-3xl sm:mt-10">
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="match-avatar-ring absolute -inset-3 rounded-full" aria-hidden="true" />
          <StudentAvatar name={profile.name} avatarUrl={profile.avatarUrl} size="xl" className="relative h-24 w-24 text-2xl sm:h-28 sm:w-28" />
          <span className="absolute -bottom-1 -right-3 rounded-full border-4 border-white bg-brand-600 px-3 py-1 text-sm font-bold text-white shadow-soft">
            {match.score}%
          </span>
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-brand-600">Your match this round</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">{profile.name}</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {profile.major || profile.faculty} · Year {profile.yearOfStudy}
        </p>
      </div>

      <div className="mt-7 grid gap-6 border-y border-brand-100/80 py-6 sm:grid-cols-[1.2fr_0.8fr]">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">About {profile.name.split(" ")[0]}</h2>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            {profile.bio || match.aiSummary || "You have some shared signals worth exploring."}
          </p>
          {match.aiSummary && profile.bio && <p className="mt-3 text-sm font-medium leading-6 text-ink">{match.aiSummary}</p>}
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Profile blocks</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.mbti && <ProfileChip label={profile.mbti} tone="violet" />}
            <ProfileChip label={profile.faculty} tone="cyan" />
            {(profile.interests ?? []).slice(0, 4).map((interest, index) => (
              <ProfileChip key={interest} label={interest} tone={index % 2 === 0 ? "coral" : "violet"} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-center text-xs font-bold uppercase tracking-[0.14em] text-ink-muted">Why you light up</h2>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {match.reasons.slice(0, 5).map((reason, index) => (
            <span key={`${reason.type}-${index}`} className="rounded-full border border-brand-100 bg-white/80 px-3 py-1.5 text-xs font-medium text-brand-700 shadow-sm">
              {describeReason(reason)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col-reverse justify-center gap-3 sm:flex-row">
        <Button variant="secondary" onClick={onPass} className="min-w-40">Not interested</Button>
        <Button onClick={onRequest} className="min-w-44">Send friend request</Button>
      </div>
      <Link href={`/profile/${profile.id}`} className="mx-auto mt-5 block w-fit text-sm font-semibold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
        View full profile
      </Link>
    </section>
  );
}

function ProfileChip({ label, tone }: { label: string; tone: "violet" | "cyan" | "coral" }) {
  const tones = {
    violet: "bg-brand-100 text-brand-800",
    cyan: "bg-cyan-100 text-cyan-800",
    coral: "bg-rose-100 text-rose-800",
  };
  return <span className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${tones[tone]}`}>{label}</span>;
}

function FeedbackState({ decision, name }: { decision: Decision | null; name: string }) {
  const requested = decision === "request";
  return (
    <section className="match-enter flex min-h-[540px] flex-col items-center justify-center text-center sm:min-h-[570px]" aria-live="polite">
      <div className={`match-feedback-icon ${requested ? "match-feedback-icon--request" : "match-feedback-icon--pass"}`} aria-hidden="true">
        {requested ? "✓" : "→"}
      </div>
      <h1 className="mt-6 font-display text-3xl font-bold text-ink">
        {requested ? "Friend request sent" : "Got it. Let's keep looking"}
      </h1>
      <p className="mt-3 text-sm text-ink-muted">
        {requested ? `We have recorded your interest in ${name}.` : "Your next bright overlap is on its way."}
      </p>
    </section>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[540px] items-center justify-center" aria-live="polite">
      <div className="text-center">
        <span className="mx-auto block h-9 w-9 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
        <p className="mt-4 text-sm text-ink-muted">Loading your matching space...</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return <p role="alert" className="mx-auto mt-24 max-w-md rounded-xl bg-red-50 p-4 text-center text-sm font-medium text-red-700">{message}</p>;
}

function EmptyState() {
  return <p className="mx-auto mt-24 max-w-md text-center text-sm font-medium text-ink-muted">There are no matches to explore yet.</p>;
}

function describeReason(reason: MatchResult["reasons"][number]): string {
  if (reason.type === "shared_course") return reason.courseCode ? `Shared course ${reason.courseCode}` : "Shared course";
  if (reason.type === "shared_interest") return reason.interest ? `Both like ${reason.interest}` : "Shared interest";
  return reason.day && reason.window ? `Both free ${reason.day} ${reason.window}` : "Shared free time";
}
