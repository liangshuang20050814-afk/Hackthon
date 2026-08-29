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
    dateLabel: start.toLocaleDateString([], { month: "short", day: "numeric" }),
  };

  if (start.toDateString() === end.toDateString()) {
    return [{ ...common, id: `event-${event.id}`, dayOfWeek, startTime: formatTime(start), endTime: formatTime(end) }];
  }
  return [
    { ...common, id: `event-${event.id}-start`, dayOfWeek, startTime: formatTime(start), endTime: "23:59" },
    { ...common, id: `event-${event.id}-end`, dayOfWeek: (dayOfWeek + 1) % 7, startTime: "00:00", endTime: formatTime(end), dateLabel: end.toLocaleDateString([], { month: "short", day: "numeric" }) },
  ];
}

type Notice = { kind: "success" | "error"; text: string } | null;

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

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex justify-start">
        <button
          type="button"
          onClick={() => setEditing((current) => !current)}
          aria-pressed={editing}
          className={`rounded-full border px-4 py-2 text-sm font-semibold shadow-soft transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
            editing
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50"
          }`}
        >
          {editing ? "✓ Done editing" : "✎ Edit timetable"}
        </button>
      </div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Your week</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Timetable</h1>
          <p className="mt-1 text-sm text-ink-muted">See every class in its weekly time slot.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/schedule/add"
            className="rounded-full border border-brand-200 bg-white px-4 py-2 text-sm font-semibold text-brand-700 shadow-soft transition hover:border-brand-400 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            + Add class
          </Link>
          <Link
            href="/schedule/classmates"
            className="rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-glass transition hover:from-brand-600 hover:to-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Find classmates
          </Link>
        </div>
      </div>

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
