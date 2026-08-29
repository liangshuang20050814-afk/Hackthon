"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface TimetableClassSession {
  kind?: "class";
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  course: { id: string; code: string; name: string };
}

export interface TimetableEventSession {
  kind: "event";
  id: string;
  eventId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
  title: string;
  eventType: string;
  dateLabel: string;
}

export type TimetableSession = TimetableClassSession | TimetableEventSession;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_HEIGHT = 52;
const GRID_HEIGHT = HOURS.length * HOUR_HEIGHT;

function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

interface PositionedSession {
  session: TimetableSession;
  column: number;
  columnCount: number;
}

function positionOverlappingSessions(sessions: TimetableSession[]): PositionedSession[] {
  const sorted = [...sessions].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime) || timeToMinutes(a.endTime) - timeToMinutes(b.endTime),
  );
  const groups: TimetableSession[][] = [];
  let currentGroup: TimetableSession[] = [];
  let groupEnd = -1;

  for (const session of sorted) {
    const start = timeToMinutes(session.startTime);
    if (currentGroup.length === 0 || start < groupEnd) {
      currentGroup.push(session);
      groupEnd = Math.max(groupEnd, timeToMinutes(session.endTime));
    } else {
      groups.push(currentGroup);
      currentGroup = [session];
      groupEnd = timeToMinutes(session.endTime);
    }
  }
  if (currentGroup.length > 0) groups.push(currentGroup);

  return groups.flatMap((group) => {
    const columnEnds: number[] = [];
    const placed = group.map((session) => {
      const start = timeToMinutes(session.startTime);
      let column = columnEnds.findIndex((end) => end <= start);
      if (column === -1) {
        column = columnEnds.length;
        columnEnds.push(0);
      }
      columnEnds[column] = timeToMinutes(session.endTime);
      return { session, column };
    });
    return placed.map(({ session, column }) => ({ session, column, columnCount: columnEnds.length }));
  });
}

export function TimetableGrid({
  sessions,
  editing = false,
  onDelete,
}: {
  sessions: TimetableSession[];
  editing?: boolean;
  onDelete?: (id: string) => void;
}) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const timetableRef = useRef<HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Keep the full 24-hour grid available, but start the viewport at 06:00.
    if (scrollAreaRef.current) scrollAreaRef.current.scrollTop = 6 * HOUR_HEIGHT;
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement === timetableRef.current);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!timetableRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await timetableRef.current.requestFullscreen();
    }
  }

  return (
    <section
      ref={timetableRef}
      aria-label="Weekly timetable"
      data-fullscreen={isFullscreen}
      className={`glass-surface overflow-hidden ${isFullscreen ? "h-screen rounded-none bg-background" : "rounded-3xl"}`}
    >
      <div className="flex h-12 items-center justify-between border-b border-brand-100 bg-white/80 px-4 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_10px_rgba(91,79,224,0.6)]" />
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-brand-800">Weekly timetable</h2>
        </div>
        <button
          type="button"
          onClick={() => void toggleFullscreen()}
          className="group flex h-8 w-8 items-center justify-center rounded-lg border border-brand-100 bg-white text-brand-700 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          aria-label={isFullscreen ? "Exit full screen timetable" : "Open timetable full screen"}
          title={isFullscreen ? "Exit full screen" : "View full screen"}
        >
          {isFullscreen ? (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6" />
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current transition-transform group-hover:scale-110" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5" />
            </svg>
          )}
        </button>
      </div>
      {sessions.length === 0 && (
        <div className="border-b border-brand-100 bg-brand-50/70 px-4 py-3 text-center text-sm text-ink-muted">
          Your timetable is empty. Add a class or join a campus event to get started.
        </div>
      )}
      <div ref={scrollAreaRef} className={`${isFullscreen ? "h-[calc(100vh-3rem)] max-h-none" : "min-h-[520px] max-h-[72vh]"} overflow-auto`}>
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
                    {positionOverlappingSessions(sessions.filter((session) => session.dayOfWeek === dayIndex)).map(({ session, column, columnCount }) => {
                      const start = timeToMinutes(session.startTime);
                      const end = timeToMinutes(session.endTime);
                      const top = (start / 60) * HOUR_HEIGHT;
                      const height = Math.max(((end - start) / 60) * HOUR_HEIGHT, 28);
                      const columnWidth = 100 / columnCount;
                      const isEvent = session.kind === "event";
                      const label = isEvent ? session.title : session.course.code;
                      return (
                        <article
                          key={session.id}
                          className={`absolute z-10 overflow-hidden rounded-lg border text-[10px] shadow-sm transition hover:z-20 hover:shadow-glass ${
                            isEvent
                              ? "border-amber-300 bg-amber-100/95"
                              : editing
                                ? "border-dashed border-brand-600 bg-brand-100/95 ring-1 ring-brand-200"
                                : "border-brand-300 bg-brand-100/95"
                          }`}
                          style={{
                            top,
                            height,
                            left: `calc(${column * columnWidth}% + 3px)`,
                            width: `calc(${columnWidth}% - 6px)`,
                          }}
                        >
                          <Link
                            href={isEvent ? `/events/${session.eventId}` : editing ? `/schedule/edit/${session.id}` : `/schedule/class/${session.id}`}
                            className="block h-full px-2 py-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-600"
                            title={`${isEvent ? "View event" : editing ? "Edit" : "View classmates for"} ${label} · ${session.startTime}–${session.endTime}${session.location ? ` · ${session.location}` : ""}`}
                          >
                            <p className={`truncate pr-4 font-bold ${isEvent ? "text-amber-900" : "text-brand-800"}`}>{isEvent ? `● ${label}` : label}</p>
                            <p className="truncate text-ink-muted">{session.startTime}–{session.endTime}</p>
                            {isEvent && height >= 48 && <p className="truncate text-amber-800">{session.eventType} · {session.dateLabel}</p>}
                            {height >= 48 && session.location && <p className="truncate text-ink-muted">{session.location}</p>}
                            {!isEvent && editing && height >= 72 && <p className="mt-1 font-semibold text-brand-700">Edit class</p>}
                          </Link>
                          {!isEvent && editing && onDelete && (
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
