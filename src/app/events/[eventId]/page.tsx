"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { StudentAvatar } from "@/components/ui/StudentAvatar";

const TYPE_ICONS: Record<string, string> = {
  Sports: "⚽", Party: "🎉", Study: "📚", Social: "☕", Gaming: "🎮", Other: "✨",
};

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
  const startsAt = new Date(event.startsAt);
  const attendancePercent = Math.min((event.attendeeCount / event.capacity) * 100, 100);
  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/events" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-700 transition hover:text-brand-900">
        <span aria-hidden="true" className="transition-transform group-hover:-translate-x-1">←</span> Back to events
      </Link>

      <section className="event-detail-stage event-detail-enter relative isolate mt-5 overflow-hidden rounded-[2rem] border border-white/80 p-5 shadow-glass sm:p-8">
        <div className="event-detail-grid pointer-events-none absolute inset-0 -z-10" />
        <div className="event-detail-orb event-detail-orb-one pointer-events-none absolute -z-10" />
        <div className="event-detail-orb event-detail-orb-two pointer-events-none absolute -z-10" />

        <div className="relative grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:gap-10">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/80 bg-white/60 px-3 py-1.5 text-xs font-bold text-brand-800 shadow-soft backdrop-blur-xl">{TYPE_ICONS[event.eventType] ?? "✨"} {event.eventType}</span>
              {event.joined && <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200/70 bg-green-50/80 px-3 py-1.5 text-xs font-bold text-green-700"><span className="h-1.5 w-1.5 rounded-full bg-green-400" /> In your timetable</span>}
            </div>

            <h1 className="mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.02] tracking-[-0.045em] text-ink sm:text-5xl lg:text-6xl">{event.title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-ink-muted sm:text-base">{event.description || "No description provided."}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void toggleAttendance()}
                disabled={saving || event.isCreator || (!event.joined && full)}
                className={`group inline-flex items-center gap-3 rounded-full px-5 py-3 text-sm font-bold shadow-glass transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:pointer-events-none disabled:opacity-55 ${event.joined ? "border border-white/80 bg-white/65 text-brand-800 backdrop-blur-xl" : "bg-gradient-to-r from-brand-600 to-brand-800 text-white"}`}
              >
                {event.isCreator ? "You're hosting" : event.joined ? "Leave event" : full ? "Event full" : saving ? "Updating…" : "Join event"}
                {!event.isCreator && !full && <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">{event.joined ? "−" : "→"}</span>}
              </button>
              {event.creator && <p className="text-sm text-ink-muted">Hosted by <Link href={`/profile/${event.creator.id}`} className="font-bold text-brand-700 hover:underline">{event.creator.name}</Link></p>}
            </div>
            {error && <p role="alert" className="mt-4 rounded-xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-700">{error}</p>}
          </div>

          <aside className="event-detail-info relative overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/55 p-5 shadow-soft backdrop-blur-2xl sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="rounded-2xl bg-white px-3 py-3 text-center text-brand-900 shadow-soft">
                <span className="block text-[10px] font-bold uppercase tracking-[0.15em] text-rose-500">{startsAt.toLocaleDateString("en-AU", { month: "short" })}</span>
                <span className="block font-display text-4xl font-bold leading-none">{startsAt.getDate()}</span>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold text-ink">{startsAt.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false })}</p>
                <p className="mt-1 text-xs font-semibold text-ink-muted">{startsAt.toLocaleDateString("en-AU", { weekday: "long" })}, {startsAt.getFullYear()}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/55 px-3 py-2.5"><dt className="text-ink-muted">Location</dt><dd className="max-w-[65%] truncate font-bold text-ink">{event.location || "TBA"}</dd></div>
              <div className="flex items-center justify-between gap-3 rounded-xl bg-white/55 px-3 py-2.5"><dt className="text-ink-muted">Duration</dt><dd className="font-bold text-ink">{event.durationMinutes} min</dd></div>
            </dl>

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold"><span className="text-ink-muted">People going</span><span className="text-brand-800">{event.attendeeCount}/{event.capacity}</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-brand-100/80"><div className="event-detail-progress h-full rounded-full bg-gradient-to-r from-brand-500 to-rose-400" style={{ width: `${attendancePercent}%` }} /></div>
              <p className="mt-2 text-[11px] text-ink-muted">{Math.max(event.capacity - event.attendeeCount, 0)} spots remaining</p>
            </div>
          </aside>
        </div>

        <div className="relative mt-8 border-t border-brand-200/50 pt-6">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-600">The crowd</p><h2 className="mt-1 font-display text-2xl font-bold text-ink">Who's going</h2></div>
            <p className="text-xs font-semibold text-ink-muted">{event.attendeeCount} students</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {event.attendees.map(({ student }, index) => (
              <Link key={student.id} href={`/profile/${student.id}`} className="event-attendee-card group flex items-center gap-3 rounded-2xl border border-white/80 bg-white/55 p-3 shadow-soft backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white/80" style={{ animationDelay: `${index * 70}ms` }}>
                <StudentAvatar name={student.name} avatarUrl={student.avatarUrl} size="md" />
                <span className="min-w-0"><span className="block truncate font-semibold text-ink">{student.name}</span><span className="block truncate text-xs text-ink-muted">{student.major || student.faculty} · Year {student.yearOfStudy}</span></span>
                <span aria-hidden="true" className="ml-auto text-brand-400 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
