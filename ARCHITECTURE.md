# Architecture

## Why this stack

A single Next.js app (App Router) instead of a separate frontend/backend repo:
one `npm run dev`, one deploy, and API routes live right next to the pages
that call them — important when 4 people are editing concurrently under a
time limit. Prisma + SQLite needs no external DB server, which matters for
seeding 30 students fast and resetting when a schema field turns out to be
wrong.

## Folder map

```
Hackthon/
├── prisma/
│   ├── schema.prisma        # [A] Source of truth for all data models
│   └── seed.ts              # [A] Generates 30 fake students + overlaps
│
├── src/
│   ├── app/                          # Next.js App Router — one folder per route
│   │   ├── layout.tsx                # [D] Root layout, wraps every page in BottomNav
│   │   ├── page.tsx                  # [D] Landing page
│   │   ├── globals.css               # [D] Design tokens (color/spacing) + Tailwind base
│   │   │
│   │   ├── login/page.tsx            # [D]
│   │   ├── profile/[studentId]/page.tsx   # [D] SHARED — A links to it from match cards,
│   │   │                                        B links to it from classmate list
│   │   │
│   │   ├── schedule/page.tsx         # [B] Manual course entry + ICS upload
│   │   ├── schedule/classmates/page.tsx   # [B] Students sharing a course
│   │   │
│   │   ├── matches/page.tsx          # [A] AI-ranked match feed with explanations
│   │   │
│   │   ├── chat/page.tsx             # [C] Conversation list
│   │   ├── chat/[conversationId]/page.tsx # [C] Thread view, polls for new messages
│   │   │
│   │   ├── events/page.tsx           # [C] Event list (no creation flow)
│   │   ├── events/[eventId]/page.tsx # [C] Event detail + join/leave button
│   │   │
│   │   └── api/
│   │       ├── students/route.ts     # [A] GET students (with courses + interests)
│   │       ├── matches/route.ts      # [A] GET /api/matches?studentId= → scored list
│   │       ├── schedule/upload/route.ts # [B] POST .ics file → parsed course list
│   │       ├── messages/route.ts     # [C] GET/POST messages for a conversation
│   │       └── events/route.ts       # [C] GET events, POST attendance
│   │
│   ├── components/
│   │   ├── ui/                # [D] BUILD FIRST — shared primitives, everyone imports these
│   │   │   ├── Card.tsx
│   │   │   ├── AvatarGroup.tsx
│   │   │   ├── Button.tsx
│   │   │   └── BottomNav.tsx
│   │   ├── schedule/TimetableGrid.tsx   # [B]
│   │   ├── chat/MessageBubble.tsx       # [C]
│   │   └── events/EventCard.tsx         # [C]
│   │
│   └── lib/
│       ├── db.ts                    # [A] Prisma client singleton, imported everywhere
│       ├── types.ts                 # [A] Shared TypeScript types (Student, MatchResult, ...)
│       ├── matching/
│       │   ├── scoring.ts           # [A] Explainable numeric scoring (see contract below)
│       │   └── claude.ts            # [A] Wraps Claude API to turn a score into 1-2 sentences
│       ├── ics/parser.ts            # [B] .ics text -> CourseSession[]
│       └── polling/useChatPolling.ts # [C] Client hook: setInterval fetch of new messages
│
├── docs/
│   ├── accessibility-checklist.md   # [D] AA contrast, keyboard nav, alt text sign-off
│   └── submission/                  # [D] The 5 submission deliverables
│       ├── pitch-deck.md
│       ├── demo-video-script.md
│       ├── team-roles.md
│       ├── tech-writeup.md
│       └── README.md
│
└── public/avatars/                  # [A/D] Placeholder avatar images for seed students
```

## Data model (owned by A)

Defined in `prisma/schema.prisma`. Everyone else only ever reads from it via
`src/lib/db.ts` (Prisma client) or the `/api/*` routes — nobody else edits the
schema without telling A, since B's and C's tables (courses, messages,
events) all hang off `Student`.

Core entities:

- `Student` — one row per (fake) user: name, avatar, bio, faculty, interests.
- `Course` / `Enrollment` — a student's timetable. **B owns the ICS
  parsing that produces `Enrollment` rows**, but the table itself lives in A's
  schema.
- `Match` — precomputed or on-demand pairwise score between two students,
  cached with its explanation so the UI doesn't recompute every render.
- `Conversation` / `Message` — chat, owned by C.
- `Event` / `EventAttendee` — events, owned by C. No `EventCreation` flow by
  design — judges only browse the list.

## The contract that matters most: matching output shape

This is the interface B and C's pages consume, and what makes the matching
feature explainable instead of a black-box percentage. A should treat this
shape as fixed once other people start building against it:

```ts
// src/lib/types.ts
interface MatchResult {
  studentId: string;
  score: number;              // 0-100, for the badge/progress ring
  reasons: MatchReason[];     // ordered, most significant first
  aiSummary: string;          // 1-2 sentence Claude-generated explanation
}

type MatchReason =
  | { type: "shared_course"; courseCode: string; courseName: string }
  | { type: "shared_interest"; interest: string }
  | { type: "shared_free_time"; day: string; window: string }; // e.g. "Wed", "14:00-16:00"
```

Example: a 95% match must be traceable to
`[{shared_course: COMP2017}, {shared_course: DATA1001}, {shared_interest: climbing}, {shared_free_time: Wed 14:00-16:00}]`
— that list is what gets rendered under the score, and it's what the judges
will remember.

## Build order / dependency graph

```
A: schema + seed  ──────────────┬──▶ B: schedule UI (needs Student/Course rows)
                                 ├──▶ C: chat/events UI (needs Student rows)
                                 └──▶ A: matching engine (needs seeded overlaps to score)

D: shared ui/ components ───────┬──▶ B: schedule pages use Card/BottomNav
                                 ├──▶ C: chat/events pages use Card/Button
                                 └──▶ D: profile + login pages (uses own components)

A + D: agree on MatchResult shape + profile page props ──▶ A wires matches page to profile links
```

Practical rule: **A's seed data and D's `components/ui/` must both land before
B or C write real UI**, so start those two in parallel at hour 0.
