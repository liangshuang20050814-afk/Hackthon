# UniSoul

UniSoul is a USYD student matching app built for the SYNCS Hackathon. It helps students find classmates, get explainable match suggestions, chat, and join campus events.

## What Judges Can Try

- **Sign up + onboarding**: create a student profile with faculty, year, interests, and optional details.
- **Matches**: see one recommended student with a match percentage and human-readable reasons.
- **Timetable**: add courses manually, upload an ICS file, and find classmates by course code.
- **Classmates**: open a course from the timetable to see everyone taking that course, including their class times.
- **Chat**: start a one-to-one conversation from a profile.
- **Events**: browse events and join/leave them.

## Tech Stack

- **Next.js 14 App Router** + TypeScript
- **Prisma + SQLite** for local data
- **Tailwind CSS** for UI
- **Python FastAPI matching service** as an optional semantic reranker
- **Local TypeScript fallback matcher** so the app still runs without Python or an LLM API

## Quick Start

Use Node.js 20 or later.

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

The seed command creates demo data:
- 30 students
- 10 courses
- 90 timetable enrollments
- 8 events

## Demo Flow

1. Open `http://localhost:3000`.
2. Sign up with any email and password.
3. Complete onboarding.
4. Go to **Matches** to see an explainable match.
5. Go to **Timetable** and add a course such as `COMP2017`.
6. Click **Find classmates** or click a course block in the timetable.
7. Open a student profile and start a chat.
8. Go to **Events** and join an event.

## Matching Algorithm

The matching system is designed to be explainable, not a black box.

It uses:

- shared course codes, such as `COMP2017`
- shared interests
- overlapping free time
- optional semantic similarity from SentenceTransformer

The UI does not only show a percentage. It also shows why the match happened, such as shared courses, shared interests, or shared free time.

The app works even when the Python service is not running. In that case, `/api/matches` uses the local TypeScript scoring fallback.

## Optional Python Matching Service

The main app does **not** require Python to run. Use this only if you want the semantic SentenceTransformer reranker.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn matching_service:app --reload --port 8000
```

Then set this in `.env` at the project root:

```bash
MATCHING_SERVICE_URL="http://localhost:8000"
```

Restart the Next.js dev server after changing `.env`.

Note: SentenceTransformer may download a model the first time it runs. If there is no internet, leave `MATCHING_SERVICE_URL` empty and use the built-in TypeScript matcher.

## Useful Commands

```bash
npm run dev              # start local app
npm run build            # production build check
npm run prisma:seed      # reset demo seed data
npx prisma migrate deploy # apply existing migrations
npx prisma generate       # refresh Prisma Client after schema changes
npx prisma studio        # inspect SQLite data
```

## Troubleshooting

### `Column email does not exist`

Your local database is missing migrations.

```bash
npx prisma migrate deploy
npx prisma generate
npm run prisma:seed
```

### `Cannot find module 'bcryptjs'`

This should not happen in the current version. The app uses Node's built-in `crypto.scrypt` for password hashing and does not depend on `bcryptjs`.

Try:

```bash
npm install
rm -rf .next
npm run dev
```

### `tsx` seed issue

If `npm run prisma:seed` has trouble on your machine, run the seed file directly:

```bash
node --import tsx prisma/seed.ts
```

### Python model download fails

The Python matching service is optional. Leave this empty in `.env`:

```bash
MATCHING_SERVICE_URL=
```

The Next.js app will still run with the local explainable matcher.

## Environment Variables

Copy `.env.example` to `.env`.

```bash
DATABASE_URL="file:./dev.db"
MATCHING_SERVICE_URL=
```

No LLM API key is required for the demo.
