"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { StudentAvatar } from "@/components/ui/StudentAvatar";

interface EventDetail {
  id: string; title: string; description: string; location: string; eventType: string; startsAt: string;
  durationMinutes: number; capacity: number; attendeeCount: number; joined: boolean; isCreator: boolean;
  creator: { id: string; name: string } | null;
  attendees: { student: { id: string; name: string; avatarUrl: string | null; faculty: string; major: string | null; yearOfStudy: number } }[];
}

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${params.eventId}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not load this event.");
      setEvent(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load this event.");
    } finally { setLoading(false); }
  }, [params.eventId]);

  useEffect(() => { void loadEvent(); }, [loadEvent]);

  async function toggleAttendance() {
    if (!event) return;
    setSaving(true); setError(null);
    const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: event.joined ? "leave" : "join", eventId: event.id }) });
    const result = await response.json();
    if (!response.ok) setError(result.error ?? "Could not update attendance.");
    else await loadEvent();
    setSaving(false);
  }

  if (loading) return <main className="mx-auto max-w-4xl p-6 text-sm text-ink-muted">Loading event…</main>;
  if (!event) return <main className="mx-auto max-w-4xl p-6"><p role="alert" className="text-red-700">{error ?? "Event not found."}</p></main>;

  const full = event.attendeeCount >= event.capacity;
  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <Link href="/events" className="text-sm font-semibold text-brand-700 hover:underline">← Back to events</Link>
      <section className="mt-5 rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 shadow-soft sm:p-8">
        <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700">{event.eventType}</span>{event.joined && <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">In your timetable</span>}</div>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink">{event.title}</h1>
        <p className="mt-3 leading-7 text-ink-muted">{event.description || "No description provided."}</p>
        <div className="mt-5 grid gap-2 text-sm text-ink sm:grid-cols-2"><p>📅 {new Date(event.startsAt).toLocaleString([], { dateStyle: "full", timeStyle: "short" })}</p><p>⏱ {event.durationMinutes} minutes</p><p>📍 {event.location}</p><p>👥 {event.attendeeCount}/{event.capacity} people</p></div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={toggleAttendance} disabled={saving || event.isCreator || (!event.joined && full)} variant={event.joined ? "secondary" : "primary"}>
            {event.isCreator ? "You're hosting" : event.joined ? "Leave event" : full ? "Event full" : saving ? "Updating…" : "Join event"}
          </Button>
          {event.creator && <p className="text-sm text-ink-muted">Hosted by <Link href={`/profile/${event.creator.id}`} className="font-semibold text-brand-700 hover:underline">{event.creator.name}</Link></p>}
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      </section>

      <section className="mt-8"><h2 className="font-display text-xl font-bold text-ink">Who's going</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">
        {event.attendees.map(({ student }) => <Link key={student.id} href={`/profile/${student.id}`} className="flex items-center gap-3 rounded-2xl border border-brand-100 bg-white p-4 shadow-soft hover:border-brand-300">
          <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} size="md" />
          <span><span className="block font-semibold text-ink">{student.name}</span><span className="block text-xs text-ink-muted">{student.major || student.faculty} · Year {student.yearOfStudy}</span></span>
        </Link>)}
      </div></section>
    </main>
  );
}
