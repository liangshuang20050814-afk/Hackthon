# Python Matching Service

Owner: A.

This service only owns matching. The Next.js app, Prisma schema, seed data,
chat, events, schedule, and profile pages stay where they are.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn matching_service:app --reload --port 8000
```

Then set the Next.js server env:

```env
MATCHING_SERVICE_URL="http://localhost:8000"
```

If `MATCHING_SERVICE_URL` is unset or the Python service is down,
`src/app/api/matches/route.ts` falls back to the local TypeScript scorer.

## Endpoint

```text
POST /rank
```

Input:

```json
{
  "queryStudent": {
    "id": "demo-student-1",
    "name": "Kenny Yu",
    "faculty": "Engineering",
    "yearOfStudy": 2,
    "courses": [{ "code": "COMP2017", "name": "Systems Programming" }],
    "interests": ["machine learning", "coffee"],
    "freeSlots": [{ "day": "Wed", "window": "14:00-16:00" }]
  },
  "candidates": [],
  "topK": 20
}
```

Output matches `src/lib/types.ts`:

```json
[
  {
    "studentId": "student-02",
    "score": 95,
    "reasons": [],
    "aiSummary": "Kenny Yu and Alice Chen both take COMP2017."
  }
]
```
