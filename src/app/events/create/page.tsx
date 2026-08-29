"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EVENT_TYPES } from "@/lib/events";

export default function CreateEventPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const data = new FormData(event.currentTarget);
    const localDateTime = String(data.get("startsAt") ?? "");

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          eventType: data.get("eventType"),
          title: data.get("title"),
          description: data.get("description"),
          location: data.get("location"),
          startsAt: new Date(localDateTime).toISOString(),
          durationMinutes: Number(data.get("durationMinutes")),
          capacity: Number(data.get("capacity")),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not create this event.");
      router.push(`/events/${result.id}`);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not create this event.");
      setSaving(false);
    }
  }

  const inputClass = "mt-1.5 w-full rounded-xl border border-brand-100 bg-white px-3 py-2.5 text-ink shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600";
  return (
    <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/events" className="text-sm font-semibold text-brand-700 hover:underline">← Back to events</Link>
      <div className="mt-5"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Bring people together</p><h1 className="mt-1 font-display text-3xl font-bold text-ink">Create an event</h1></div>
      <Card className="mt-6 p-5 sm:p-7">
        {error && <p role="alert" className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="text-sm font-semibold text-ink sm:col-span-2">Event type<select name="eventType" className={inputClass}>{EVENT_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">Event name<input name="title" required minLength={2} maxLength={80} placeholder="Sunset football at The Square" className={inputClass} /></label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">Description<textarea name="description" rows={3} placeholder="What should people know or bring?" className={inputClass} /></label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">Location<input name="location" placeholder="The Square" className={inputClass} /></label>
          <label className="text-sm font-semibold text-ink sm:col-span-2">Date and time<input name="startsAt" type="datetime-local" required className={inputClass} /></label>
          <label className="text-sm font-semibold text-ink">Duration<select name="durationMinutes" defaultValue="60" className={inputClass}><option value="30">30 minutes</option><option value="60">1 hour</option><option value="90">1.5 hours</option><option value="120">2 hours</option><option value="180">3 hours</option><option value="240">4 hours</option></select></label>
          <label className="text-sm font-semibold text-ink">People needed<input name="capacity" type="number" min={2} max={100} defaultValue={8} required className={inputClass} /></label>
          <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2"><Button type="submit" disabled={saving}>{saving ? "Creating…" : "Create event"}</Button><Link href="/events" className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted hover:bg-brand-50">Cancel</Link></div>
        </form>
      </Card>
    </main>
  );
}
