# UniSoul demo video script [Owner: D]

## Target

- Length: 80–90 seconds
- Format: screen recording with voice-over added afterward
- Resolution: 1920×1080, browser zoom at 110–125%
- Demo user: use one fixed seeded student for every scene
- Core message: UniSoul turns a timetable into explainable, low-pressure student connections

Do not record the entire demo in one take. Record each scene as a separate
5–20 second clip, then join the best takes. Keep the cursor still while the
voice-over explains something.

## Shot-by-shot script

| Time | Screen recording | English voice-over |
|---|---|---|
| 0:00–0:06 | Start on the landing or login page. Pause briefly on the UniSoul name, then click **Continue**. | **“University can feel crowded and lonely at the same time. UniSoul helps students find the right people already around them.”** |
| 0:06–0:18 | Open **Schedule**. Show the timetable, then quickly demonstrate either entering a course code or uploading an ICS file. | **“Students add their classes manually or import their existing timetable in seconds.”** |
| 0:18–0:31 | Click **Find classmates**. Scroll through classmates who share courses. Open one profile and briefly show their courses and interests. | **“UniSoul immediately reveals classmates from the same real University of Sydney courses, turning familiar faces into approachable connections.”** |
| 0:31–0:50 | Open **Matches**. Stop on the strongest card. Point at the percentage, then the shared courses, interests, and free-time reason. | **“But this is more than a class directory. Our explainable matching engine shows exactly why two students connect: two shared courses, three common interests, and a free Wednesday afternoon.”** |
| 0:50–1:03 | Open that student's profile, then enter **Chat** and send one short prepared message such as “Hey! Want to study after COMP2017 on Wednesday?” | **“Once a match feels right, students can start a conversation around something they already share—without the awkward cold introduction.”** |
| 1:03–1:14 | Open **Events**, choose one event, show attendee avatars, and click **Join**. | **“Campus events create another easy path from online discovery to real-world community.”** |
| 1:14–1:24 | Show a clean montage: timetable → explanation card → chat → joined event. End on the logo or strongest match screen. | **“UniSoul uses schedules, shared interests, and AI-assisted explanations to make belonging at university practical, transparent, and human.”** |
| 1:24–1:30 | End card with product name, team name, and short tagline. | **“UniSoul—find your people, right where you already are.”** |

## Text for the end card

```text
UniSoul
Find your people, right where you already are.

SYNCS Hackathon 2026
Next.js · Prisma · Explainable AI Matching
```

## Prepared demo content

Use fixed data so every take looks intentional:

- Current student: the profile with the richest seeded timetable
- Match to feature: a student with at least 2 shared courses, 3 shared interests, and 1 overlapping free-time window
- Message to send: `Hey! Want to study after COMP2017 on Wednesday?`
- Event to join: choose the event with the best image and several attendees
- Keep the best match visible near the top of the list before recording

## Fast recording checklist

1. Reset and seed the database before filming.
2. Close unrelated tabs, notifications, bookmarks, and developer tools.
3. Use fake student data only; never show API keys or local file paths.
4. Pre-open the required pages in separate tabs as a fallback.
5. Record the screen silently, one scene at a time.
6. Record the voice-over separately in a quiet room.
7. Cut every loading delay longer than half a second.
8. Add subtle zooms only around the match reasons and Join button.
9. Add captions for all narration; keep music below the voice.
10. Export at 1080p and watch the final file once with sound off to verify that the product story is still understandable visually.

## Stability fallbacks

- If ICS upload is unreliable, show the file being selected, then cut directly to the populated timetable.
- If the AI API is slow, use precomputed match summaries from the seed data.
- If live chat polling is unreliable, send the message once, then cut to a prepared conversation containing it.
- If event joining fails, record the joined state in a separate seeded take.
- Never leave an error, spinner, empty list, or terminal command in the final video.

## Optional 45-second version

For a shorter submission, keep scenes 1–4 and the final end card. Use this compressed narration:

> “University can feel crowded and lonely at the same time. UniSoul imports a student's timetable, finds classmates from real University of Sydney courses, and ranks meaningful connections. Unlike a black-box matching app, every score is explained through shared courses, interests, and overlapping free time. Students can then chat or meet through campus events. UniSoul makes finding your people practical, transparent, and human.”
