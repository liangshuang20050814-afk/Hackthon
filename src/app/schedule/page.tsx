"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TimetableGrid, TimetableSession } from "@/components/schedule/TimetableGrid";

interface JoinedEvent {
  id: string;
  title: string;
  eventType: string;
  startsAt: string;
  durationMinutes: number;
  location: string;
}

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function eventToTimetableSessions(event: JoinedEvent): TimetableSession[] {
  const start = new Date(event.startsAt);
  const end = new Date(start.getTime() + event.durationMinutes * 60_000);
  const dayOfWeek = (start.getDay() + 6) % 7;
  const common = {
    kind: "event" as const,
    eventId: event.id,
    location: event.location || null,
    title: event.title,
    eventType: event.eventType,
    dateLabel: start.toLocaleDateString("en-AU", { month: "short", day: "numeric" }),
  };

  if (start.toDateString() === end.toDateString()) {
    return [{ ...common, id: `event-${event.id}`, dayOfWeek, startTime: formatTime(start), endTime: formatTime(end) }];
  }
  return [
    { ...common, id: `event-${event.id}-start`, dayOfWeek, startTime: formatTime(start), endTime: "23:59" },
    { ...common, id: `event-${event.id}-end`, dayOfWeek: (dayOfWeek + 1) % 7, startTime: "00:00", endTime: formatTime(end), dateLabel: end.toLocaleDateString("en-AU", { month: "short", day: "numeric" }) },
  ];
}

type Notice = { kind: "success" | "error"; text: string } | null;

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function SchedulePage() {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);
  const [editing, setEditing] = useState(false);

  const loadSchedule = useCallback(async () => {
    try {
      const [scheduleResponse, eventsResponse] = await Promise.all([
        fetch("/api/schedule", { cache: "no-store" }),
        fetch("/api/events?mine=true", { cache: "no-store" }),
      ]);
      if (!scheduleResponse.ok || !eventsResponse.ok) throw new Error("Could not load your timetable.");
      const classes: TimetableSession[] = await scheduleResponse.json();
      const events: JoinedEvent[] = await eventsResponse.json();
      setSessions([...classes, ...events.flatMap(eventToTimetableSessions)]);
    } catch (error) {
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "Could not load your timetable.",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSchedule();
  }, [loadSchedule]);

  async function handleDelete(id: string) {
    const session = sessions.find((item) => item.id === id);
    if (!session || session.kind === "event") return;
    const confirmed = window.confirm(
      `Remove ${session?.course.code ?? "this class"} from your timetable? This cannot be undone.`,
    );
    if (!confirmed) return;

    const response = await fetch(`/api/schedule?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (response.ok) {
      setSessions((current) => current.filter((session) => session.id !== id));
      setNotice({ kind: "success", text: "Class removed from your timetable." });
      return;
    }

    const result = await response.json();
    setNotice({ kind: "error", text: result.error ?? "Could not remove this class." });
  }

  const classCount = sessions.filter((session) => session.kind !== "event").length;
  const eventCount = new Set(
    sessions.filter((session) => session.kind === "event").map((session) => session.eventId),
  ).size;
  const activeDays = new Set(sessions.map((session) => session.dayOfWeek)).size;
  const previewSessions = [...sessions]
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startTime.localeCompare(b.startTime))
    .slice(0, 3);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <section className="schedule-hero schedule-hero-enter relative isolate overflow-hidden rounded-[2rem] border border-white/70 px-5 py-5 shadow-glass sm:px-8 sm:py-7">
        <div className="schedule-hero-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="schedule-aurora schedule-aurora-one pointer-events-none absolute -z-10" />
        <div className="schedule-aurora schedule-aurora-two pointer-events-none absolute -z-10" />

        <div className="relative grid items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="flex min-w-0 flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 backdrop-blur-md">
                  <span className="schedule-live-dot h-2 w-2 rounded-full bg-cyan-400" />
                  Your week
                </p>
              </div>

              <h1 className="mt-6 max-w-2xl font-display text-5xl font-bold leading-none tracking-[-0.05em] text-ink sm:text-6xl">Timetable</h1>

              <div className="mt-5 max-w-xl">
                <Link
                  href="/schedule/classmates"
                  className="schedule-classmates-action group relative flex min-h-[78px] w-full items-center justify-between overflow-hidden rounded-[1.4rem] px-6 py-4 text-white shadow-glass transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_44px_-14px_rgba(74,63,196,0.8)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span className="relative z-10 font-display text-xl font-bold sm:text-2xl">Find classmates</span>
                  <span aria-hidden="true" className="schedule-classmates-arrow relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-white/15 text-xl backdrop-blur transition-transform duration-300 group-hover:translate-x-1 group-hover:rotate-[-8deg]">↗</span>
                </Link>
              </div>

              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/schedule/add"
                  className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-5 py-3 text-sm font-bold text-brand-800 shadow-soft backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  <span aria-hidden="true" className="text-lg leading-none">+</span>
                  Add class
                </Link>
                <button
                  type="button"
                  onClick={() => setEditing((current) => !current)}
                  aria-pressed={editing}
                  className={`inline-flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold backdrop-blur-md transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                    editing
                      ? "border-brand-500 bg-brand-600 text-white shadow-glass"
                      : "border-white/80 bg-white/55 text-brand-800 shadow-soft hover:-translate-y-0.5 hover:bg-white/85"
                  }`}
                >
                  <span aria-hidden="true">{editing ? "✓" : "✦"}</span>
                  {editing ? "Done editing" : "Edit timetable"}
                </button>
              </div>
            </div>

            <dl className="mt-7 grid max-w-xl grid-cols-3 gap-2 sm:gap-3">
              {[
                [loading ? "—" : classCount, "Classes"],
                [loading ? "—" : eventCount, "Events"],
                [loading ? "—" : `${activeDays}/7`, "Active days"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-white/70 bg-white/45 px-3 py-3 backdrop-blur-md sm:px-4">
                  <dd className="font-display text-xl font-bold text-ink sm:text-2xl">{value}</dd>
                  <dt className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-muted sm:text-xs">{label}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="schedule-week-panel relative hidden min-h-[300px] overflow-hidden rounded-[1.6rem] border border-white/75 bg-white/45 p-5 shadow-soft backdrop-blur-xl lg:block">
            <div className="schedule-orbit schedule-orbit-outer" />
            <div className="schedule-orbit schedule-orbit-inner" />
            <div className="relative z-10 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">Week signal</p>
              <span className="rounded-full bg-brand-100/80 px-2.5 py-1 text-[10px] font-bold text-brand-800">LIVE</span>
            </div>

            <div className="relative z-10 mt-7 space-y-3">
              {(previewSessions.length > 0 ? previewSessions : [null, null, null]).map((session, index) => {
                const isEvent = session?.kind === "event";
                const label = session ? (isEvent ? session.title : session.course.code) : loading ? "Syncing your week…" : "Open space";
                return (
                  <div
                    key={session?.id ?? `empty-${index}`}
                    className={`schedule-preview-card flex items-center gap-3 rounded-2xl border p-3 shadow-soft backdrop-blur-md ${
                      isEvent ? "border-amber-200/80 bg-amber-50/85" : "border-white/80 bg-white/80"
                    }`}
                    style={{ animationDelay: `${index * 130}ms` }}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-xs font-bold ${
                      isEvent ? "bg-amber-200 text-amber-900" : "bg-gradient-to-br from-brand-500 to-brand-800 text-white"
                    }`}>
                      {session ? DAY_LABELS[session.dayOfWeek] : "··"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-ink">{label}</p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                        {session ? `${session.startTime}–${session.endTime}${session.location ? ` · ${session.location}` : ""}` : "Your next moments appear here"}
                      </p>
                    </div>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${isEvent ? "bg-amber-400" : "bg-cyan-400"}`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {notice && (
        <p
          role={notice.kind === "error" ? "alert" : "status"}
          className={`rounded-xl px-4 py-3 text-sm ${
            notice.kind === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"
          }`}
        >
          {notice.text}
        </p>
      )}

      {editing && (
        <p className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          Editing mode is on. Select a class to edit it, or use the × button to delete it.
        </p>
      )}

      {loading ? (
        <div className="glass-surface flex min-h-96 items-center justify-center rounded-3xl text-sm text-ink-muted">
          Loading timetable…
        </div>
      ) : (
        <TimetableGrid sessions={sessions} editing={editing} onDelete={handleDelete} />
      )}
    </main>
  );
}
