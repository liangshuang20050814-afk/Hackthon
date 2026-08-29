"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export interface TimetableSession {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  course: { id: string; code: string; name: string };
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_HEIGHT = 52;
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

export function TimetableGrid({
  sessions,
  onDelete,
}: {
  sessions: TimetableSession[];
  onDelete?: (id: string) => void;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Keep the full 24-hour grid available, but start the viewport at 06:00.
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = 6 * HOUR_HEIGHT;
  }, []);

  return (
    <section aria-label="Weekly timetable" className="glass-surface overflow-hidden rounded-3xl">
      {sessions.length === 0 && (
        <div className="border-b border-brand-100 bg-brand-50/70 px-4 py-3 text-center text-sm text-ink-muted">
          Your timetable is empty. Use “Add class” to add your first class.
        </div>
      )}
      <div ref={scrollAreaRef} className="min-h-[520px] max-h-[72vh] overflow-auto">
        <div className="min-w-[920px]">
          <div className="sticky top-0 z-30 grid grid-cols-[64px_repeat(7,minmax(118px,1fr))] border-b border-brand-100 bg-white/95 backdrop-blur">
            <div className="border-r border-brand-100 px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink-muted">Time</div>
            {DAY_LABELS.map((day) => (
              <div key={day} className="border-r border-brand-100 px-2 py-3 text-center text-sm font-bold text-ink last:border-r-0">{day}</div>
            ))}
          </div>

          <div className="flex">
            <div className="relative w-16 shrink-0 border-r border-brand-100 bg-white/70" style={{ height: GRID_HEIGHT }}>
              {HOURS.map((hour) => (
                <span key={hour} className="absolute right-2 -translate-y-1/2 text-[10px] font-medium text-ink-muted" style={{ top: hour * HOUR_HEIGHT }}>
                  {String(hour).padStart(2, "0")}:00
                </span>
              ))}
            </div>

            <div className="relative flex-1 bg-white/45" style={{ height: GRID_HEIGHT }}>
              <div className="pointer-events-none absolute inset-0">
                {HOURS.map((hour) => (
                  <div key={hour} className="absolute left-0 right-0 border-t border-brand-100/80" style={{ top: hour * HOUR_HEIGHT }} />
                ))}
              </div>

              <div className="absolute inset-0 grid grid-cols-7">
                {DAY_LABELS.map((dayLabel, dayIndex) => (
                  <div key={dayLabel} className="relative border-r border-brand-100/80 last:border-r-0">
                    {sessions.filter((session) => session.dayOfWeek === dayIndex).map((session) => {
                      const start = timeToMinutes(session.startTime);
                      const end = timeToMinutes(session.endTime);
                      const top = (start / 60) * HOUR_HEIGHT;
                      const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 28);
                      return (
                        <article
                          key={session.id}
                          className="absolute left-1 right-1 z-10 overflow-hidden rounded-lg border border-brand-300 bg-brand-100/95 text-[10px] shadow-sm transition hover:z-20 hover:shadow-glass"
                          style={{ top, height }}
                        >
                          <Link
                            href={`/schedule/class/${session.id}`}
                            className="block h-full px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-600"
                            title={`${session.course.code} · ${session.startTime}–${session.endTime}${session.location ? ` · ${session.location}` : ""} · View classmates`}
                          >
                            <p className="truncate pr-4 font-bold text-brand-800">{session.course.code}</p>
                            <p className="truncate text-ink-muted">{session.startTime}–{session.endTime}</p>
                            {height >= 48 && session.location && <p className="truncate text-ink-muted">{session.location}</p>}
                          </Link>
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => onDelete(session.id)}
                              className="absolute right-1 top-1 z-20 flex h-4 w-4 items-center justify-center rounded-full text-sm leading-none text-brand-800 hover:bg-white/80 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600"
                              aria-label={`Remove ${session.course.code} on ${dayLabel}`}
                              title="Remove class"
                            >
                              ×
                            </button>
                          )}
                        </article>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
