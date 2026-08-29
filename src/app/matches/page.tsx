// [Owner: A] General matching only. Timetable-based classmate matching lives
// in /schedule/classmates so the two flows do not duplicate each other.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { DEMO_STUDENT_ID } from "@/lib/demo-user";
import type { MatchResult, StudentSummary } from "@/lib/types";
import { StudentAvatar } from "@/components/ui/StudentAvatar";

type MatchWithStudent = MatchResult & { student: StudentSummary };

export default function MatchesPage() {
  const [match, setMatch] = useState<MatchWithStudent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMatch() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/matches?studentId=${DEMO_STUDENT_ID}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Could not load match.");
        }

        const generalMatch = (await response.json()) as MatchWithStudent | null;
        if (!cancelled) {
          setMatch(generalMatch);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load match.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMatch();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Matching</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Find your best match</h1>
      </div>

      {loading && (
        <Card className="flex min-h-48 items-center justify-center text-sm text-ink-muted">
          Loading match...
        </Card>
      )}

      {!loading && error && (
        <Card>
          <p role="alert" className="text-sm font-medium text-red-700">
            {error}
          </p>
        </Card>
      )}

      {!loading && !error && (match ? <MatchCard match={match} /> : <EmptyState />)}
    </main>
  );
}

function MatchCard({ match }: { match: MatchWithStudent }) {
  return (
    <Link
      href={`/profile/${match.studentId}`}
      className="rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <Card className="flex flex-col gap-4 p-6 transition-shadow hover:shadow-md">
        <div className="flex items-center gap-3">
          <StudentAvatar name={match.student.name} avatarUrl={match.student.avatarUrl} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-lg font-bold text-ink">{match.student.name}</h2>
            <p className="truncate text-sm text-ink-muted">
              {match.student.faculty} · Year {match.student.yearOfStudy}
            </p>
          </div>
          <span className="rounded-full bg-brand-600 px-3 py-1.5 text-sm font-bold text-white">
            {match.score}%
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {match.reasons.slice(0, 5).map((reason, index) => (
            <span
              key={`${reason.type}-${index}`}
              className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700"
            >
              {describeReason(reason)}
            </span>
          ))}
        </div>

        {match.aiSummary && <p className="text-sm leading-6 text-ink-muted">{match.aiSummary}</p>}
      </Card>
    </Link>
  );
}

function EmptyState() {
  return (
    <Card>
      <p className="text-sm font-medium text-ink-muted">No general match yet.</p>
    </Card>
  );
}

function describeReason(reason: MatchResult["reasons"][number]): string {
  if (reason.type === "shared_course") return reason.courseCode ? `Both take ${reason.courseCode}` : "Shared course";
  if (reason.type === "shared_interest") return reason.interest ? `Both like ${reason.interest}` : "Shared interest";
  return reason.day && reason.window ? `Both free ${reason.day} ${reason.window}` : "Shared free time";
}
