"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { TimetableSession } from "@/components/schedule/TimetableGrid";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function EditClassPage() {
  const { enrollmentId } = useParams<{ enrollmentId: string }>();
  const router = useRouter();
  const [session, setSession] = useState<TimetableSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClass() {
      try {
        const response = await fetch(`/api/schedule?id=${encodeURIComponent(enrollmentId)}`, { cache: "no-store" });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not load this class.");
        setSession(result);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Could not load this class.");
      } finally {
        setLoading(false);
      }
    }
    void loadClass();
  }, [enrollmentId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch(`/api/schedule?id=${encodeURIComponent(enrollmentId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseCode: data.get("courseCode"),
          courseName: data.get("courseName"),
          dayOfWeek: Number(data.get("dayOfWeek")),
          startTime: data.get("startTime"),
          endTime: data.get("endTime"),
          location: data.get("location"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update this class.");
      router.push("/schedule");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not update this class.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!session || !window.confirm(`Remove ${session.course.code} from your timetable? This cannot be undone.`)) return;
    setSaving(true);
    setError(null);
    const response = await fetch(`/api/schedule?id=${encodeURIComponent(enrollmentId)}`, { method: "DELETE" });
    if (response.ok) {
      router.push("/schedule");
      router.refresh();
      return;
    }
    const result = await response.json();
    setError(result.error ?? "Could not remove this class.");
    setSaving(false);
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-brand-100 bg-white px-3 py-2.5 text-ink shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600";

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/schedule" className="text-sm font-semibold text-brand-700 hover:underline">← Back to timetable</Link>
      <div className="mt-5">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Timetable</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-ink">Edit class</h1>
        <p className="mt-1 text-sm text-ink-muted">Update the course details or remove it from your week.</p>
      </div>

      <Card className="mt-6 p-5 sm:p-7">
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        {loading && <p className="text-sm text-ink-muted">Loading class…</p>}
        {!loading && session && (
          <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
            <label className="text-sm font-semibold text-ink">
              Course code
              <input name="courseCode" required pattern="[A-Za-z]{4}[0-9]{4}" defaultValue={session.course.code} className={`${inputClass} uppercase`} />
            </label>
            <label className="text-sm font-semibold text-ink">
              Course name
              <input name="courseName" defaultValue={session.course.name} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-ink sm:col-span-2">
              Day
              <select name="dayOfWeek" defaultValue={session.dayOfWeek} className={inputClass}>
                {WEEKDAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-ink">
              Starts
              <input name="startTime" type="time" required defaultValue={session.startTime} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-ink">
              Ends
              <input name="endTime" type="time" required defaultValue={session.endTime} className={inputClass} />
            </label>
            <label className="text-sm font-semibold text-ink sm:col-span-2">
              Location
              <input name="location" defaultValue={session.location ?? ""} className={inputClass} />
            </label>
            <div className="flex flex-wrap items-center gap-3 border-t border-brand-100 pt-5 sm:col-span-2">
              <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
              <Link href="/schedule" className="rounded-full px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-brand-50">Cancel</Link>
              <button type="button" onClick={handleDelete} disabled={saving} className="sm:ml-auto rounded-full px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">
                Delete class
              </button>
            </div>
          </form>
        )}
      </Card>
    </main>
  );
}
