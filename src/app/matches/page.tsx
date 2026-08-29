// [Owner: A] AI-ranked match feed. Fetches from /api/matches and renders
// each MatchReason explicitly — the score badge alone is not enough, the
// reasons list under it is the point of the feature.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { MatchResult } from "@/lib/types";

// TODO [A]: replace with real logged-in student id once login (D) exists.
const CURRENT_STUDENT_ID = "demo-student-1";

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchResult[]>([]);

  useEffect(() => {
    fetch(`/api/matches?studentId=${CURRENT_STUDENT_ID}`)
      .then((res) => res.json())
      .then(setMatches);
  }, []);

  return (
    <main className="flex flex-col gap-3 p-6">
      <h1 className="text-xl font-bold">Your matches</h1>
      {matches.map((match) => (
        <Link key={match.studentId} href={`/profile/${match.studentId}`}>
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{match.score}% match</span>
            </div>
            <ul className="text-sm text-gray-600">
              {match.reasons.map((reason, i) => (
                <li key={i}>{describeReason(reason)}</li>
              ))}
            </ul>
            {match.aiSummary && <p className="text-sm italic">{match.aiSummary}</p>}
          </Card>
        </Link>
      ))}
    </main>
  );
}

function describeReason(reason: MatchResult["reasons"][number]): string {
  if (reason.type === "shared_course") return `Both take ${reason.courseCode}`;
  if (reason.type === "shared_interest") return `Both into ${reason.interest}`;
  return `Both free ${reason.day} ${reason.window}`;
}
