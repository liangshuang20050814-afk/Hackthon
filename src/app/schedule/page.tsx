"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { TimetableGrid, TimetableSession } from "@/components/schedule/TimetableGrid";

type Notice = { kind: "success" | "error"; text: string } | null;

export default function SchedulePage() {
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);

  const loadSchedule = useCallback(async () => {
    try {
      const response = await fetch("/api/schedule", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load your timetable.");
      setSessions(await response.json());
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

      {loading ? (
        <div className="glass-surface flex min-h-96 items-center justify-center rounded-3xl text-sm text-ink-muted">
          Loading timetable…
        </div>
      ) : (
        <TimetableGrid sessions={sessions} onDelete={handleDelete} />
      )}
    </main>
  );
}
