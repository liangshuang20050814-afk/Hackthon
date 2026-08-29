# Tech write-up [Owner: D]

Summarize for judges — see ARCHITECTURE.md for the full detail to draw from.

- **Stack**: Next.js (App Router) + TypeScript, Prisma/SQLite, Tailwind CSS,
  Anthropic Claude API.
- **What makes matching different**: every score is explainable — traced
  back to shared courses, shared interests, and shared free time (see
  `src/lib/matching/scoring.ts` and `src/lib/types.ts`'s `MatchReason`),
  with Claude used only to phrase the explanation, not to compute the score.
- **Data**: 30 seeded students with real USYD course codes and deliberately
  overlapping timetables (`prisma/seed.ts`).
