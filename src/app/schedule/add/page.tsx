"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function AddClassPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
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
      if (!response.ok) throw new Error(result.error ?? "Could not add this class.");
      router.push("/schedule");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not add this class.");
      setSaving(false);
    }
  }

  const inputClass =
    "mt-1.5 w-full rounded-xl border border-brand-100 bg-white px-3 py-2.5 text-ink shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600";

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/schedule" className="text-sm font-semibold text-brand-700 hover:underline">
        ← Back to timetable
      </Link>
      <div className="mt-5">
        <h1 className="font-display text-3xl font-bold text-ink">Add a class</h1>
        <p className="mt-1 text-sm text-ink-muted">Place a new class in your weekly timetable.</p>
      </div>

      <Card className="mt-6 p-5 sm:p-7">
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold text-ink">
            Course code
            <input name="courseCode" required pattern="[A-Za-z]{4}[0-9]{4}" placeholder="COMP2017" className={`${inputClass} uppercase`} />
          </label>
          <label className="text-sm font-semibold text-ink">
            Course name
            <input name="courseName" placeholder="Systems Programming" className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Day
            <select name="dayOfWeek" className={inputClass}>
              {WEEKDAYS.map((day, index) => <option key={day} value={index}>{day}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-ink">
            Starts
            <input name="startTime" type="time" required defaultValue="09:00" className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-ink">
            Ends
            <input name="endTime" type="time" required defaultValue="10:00" className={inputClass} />
          </label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Location
            <input name="location" placeholder="J12/101" className={inputClass} />
          </label>
          <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Adding…" : "Add to timetable"}</Button>
            <Link href="/schedule" className="rounded-full px-4 py-2 text-sm font-semibold text-ink-muted hover:bg-brand-50">Cancel</Link>
          </div>
        </form>
      </Card>
    </main>
  );
}
