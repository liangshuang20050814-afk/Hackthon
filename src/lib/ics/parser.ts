// [Owner: B] Parses an uploaded .ics timetable file into the weekly
// recurring session shape that prisma's Enrollment model expects.
// Suggested library: `ical.js` (already in package.json).
import ICAL from "ical.js";

export interface ParsedSession {
  courseCode: string; // TODO [B]: derive from event SUMMARY/description — USYD
  //          ICS exports usually put the course code in the title.
  dayOfWeek: number; // 0 = Monday .. 6 = Sunday
  startTime: string; // "14:00"
  endTime: string; // "16:00"
  location?: string;
}

export function parseIcsToSessions(icsText: string): ParsedSession[] {
  // TODO [B]: implement recurring-event expansion (RRULE) so a single
  // weekly lecture in the .ics file becomes one ParsedSession, not one
  // per calendar occurrence.
  const jcalData = ICAL.parse(icsText);
  const comp = new ICAL.Component(jcalData);
  const vevents = comp.getAllSubcomponents("vevent");

  return vevents.map((vevent) => {
    const event = new ICAL.Event(vevent);
    const start = event.startDate.toJSDate();
    const end = event.endDate.toJSDate();

    return {
      courseCode: extractCourseCode(event.summary),
      dayOfWeek: (start.getDay() + 6) % 7, // JS: 0=Sun -> shift to 0=Mon
      startTime: formatTime(start),
      endTime: formatTime(end),
      location: event.location || undefined,
    };
  });
}

function extractCourseCode(summary: string): string {
  // TODO [B]: replace with a real regex once you've seen actual USYD
  // .ics export format, e.g. match /[A-Z]{4}\d{4}/.
  return summary.trim();
}

function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5); // "HH:MM"
}
