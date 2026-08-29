# UniMatch — SYNCS Hackathon Project

A student-matching app for USYD: find people in your classes, get AI-explained
match suggestions, chat with them, and see campus events.

## Team & ownership

| Owner | Area | Folder(s) |
|-------|------|-----------|
| **A** | Data layer + AI matching engine | `prisma/`, `src/lib/matching/`, `src/lib/db.ts`, `src/app/api/students`, `src/app/api/matches`, `src/app/matches` |
| **B** | Timetable: manual input, ICS parsing, classmates list | `src/lib/ics/`, `src/app/schedule/`, `src/components/schedule/`, `src/app/api/schedule` |
| **C** | Chat + Events | `src/lib/polling/`, `src/app/chat/`, `src/app/events/`, `src/components/chat/`, `src/components/events/`, `src/app/api/messages`, `src/app/api/events` |
| **D** | Design system, login/onboarding/profile pages, accessibility, video & submission | `src/components/ui/`, `src/app/profile/`, `src/app/login/`, `src/app/onboarding/`, `src/app/globals.css`, `docs/` |

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full folder map, data contracts
between owners, and the build order.

## Critical path (first 4 hours)

1. **A** ships `prisma/schema.prisma` + `prisma/seed.ts` (30 fake students,
   real USYD course codes, deliberately overlapping timetables). Everyone else
   is blocked on this for real data.
2. **D** ships shared UI primitives in `src/components/ui/` (Card, AvatarGroup,
   Button, TopNav, color tokens in `globals.css`) so B/C don't invent their
   own styles.
3. **B** and **C** build against the seeded data + shared components as soon
   as both land.
4. **C** finishes Events first (lightest feature), then helps **B** with the
   timetable/classmates flow, since that's the most demo-critical path.
5. **D** moves to accessibility pass, then owns the demo video and the five
   submission deliverables.

## Getting started

```bash
npm install
cp .env.example .env
npx prisma db push
npx prisma db seed
npm run dev
```

## Tech stack

- **Next.js 14 (App Router)** + TypeScript — one app, one dev server, no
  frontend/backend split to coordinate during a hackathon.
- **Prisma + SQLite** — zero-config local DB, fast to seed and reset.
- **Tailwind CSS** — utility classes on top of D's shared design tokens.
- **Anthropic Claude API** — generates the human-readable "why you matched"
  explanation on top of A's numeric scoring.
- **Polling (no WebSockets)** — simplest thing that works for a chat demo.
