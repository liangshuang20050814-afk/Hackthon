"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AvatarGroup } from "@/components/ui/AvatarGroup";

const TYPE_ICONS: Record<string, string> = {
  Sports: "⚽", Party: "🎉", Study: "📚", Social: "☕", Gaming: "🎮", Other: "✨",
};
const EVENT_FILTERS = ["All", "Sports", "Party", "Study", "Social", "Gaming", "Other"];

interface EventListItem {
  id: string;
  title: string;
  location: string;
  eventType: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  attendeeCount: number;
  joined: boolean;
  creator: { name: string } | null;
  attendees: { student: { id: string; name: string; avatarUrl: string | null } }[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    fetch("/api/events", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not load events.");
        return result;
      })
      .then(setEvents)
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : "Could not load events."))
      .finally(() => setLoading(false));
  }, []);

  const joinedCount = events.filter((event) => event.joined).length;
  const openSpots = events.reduce((total, event) => total + Math.max(event.capacity - event.attendeeCount, 0), 0);
  const sortedEvents = [...events].sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  const filteredEvents = activeType === "All" ? sortedEvents : sortedEvents.filter((event) => event.eventType === activeType);

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
      <section className="events-stage events-stage-enter relative isolate overflow-hidden rounded-[2rem] border border-white/10 px-5 py-5 text-white shadow-[0_28px_70px_-28px_rgba(44,38,120,0.75)] sm:px-8 sm:py-7">
        <div className="events-stage-noise pointer-events-none absolute inset-0 -z-10" />
        <div className="events-stage-orb events-stage-orb-one pointer-events-none absolute -z-10" />
        <div className="events-stage-orb events-stage-orb-two pointer-events-none absolute -z-10" />
        <div className="events-board-orbit events-board-orbit-outer pointer-events-none absolute -z-10" aria-hidden="true" />
        <div className="events-board-orbit events-board-orbit-inner pointer-events-none absolute -z-10" aria-hidden="true" />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
            <span className="events-live-dot h-2 w-2 rounded-full bg-rose-400" /> Campus live
          </p>
          <div className="flex items-center gap-4 text-xs font-semibold text-white/60">
            <span><b className="text-white">{loading ? "—" : events.length}</b> events</span>
            <span><b className="text-white">{loading ? "—" : joinedCount}</b> joined</span>
            <span className="hidden sm:inline"><b className="text-white">{loading ? "—" : openSpots}</b> spots</span>
          </div>
        </div>

        <div className="relative mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative z-10">
            <h1 className="font-display text-6xl font-bold leading-[0.84] tracking-[-0.065em] sm:text-7xl">
              Events<span className="text-rose-400">.</span>
            </h1>
          </div>
          <Link
            href="/events/create"
            className="events-stage-cta group relative z-10 inline-flex w-fit items-center gap-4 rounded-full bg-white px-5 py-3 font-bold text-brand-900 shadow-[0_14px_34px_-12px_rgba(255,255,255,0.65)] transition-all duration-300 hover:-translate-y-1 hover:px-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Create an event
            <span aria-hidden="true" className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-lg text-white transition-transform duration-300 group-hover:rotate-90">+</span>
          </Link>
        </div>

        <div className="relative mt-7 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Filter events by type">
          {EVENT_FILTERS.map((type) => (
            <button key={type} type="button" onClick={() => setActiveType(type)} aria-pressed={activeType === type} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-xl transition ${activeType === type ? "border-white bg-white text-brand-900 shadow-lg" : "border-white/15 bg-white/5 text-white/65 hover:border-white/35 hover:bg-white/10 hover:text-white"}`}>
              {type !== "All" && <span aria-hidden="true">{TYPE_ICONS[type]} </span>}{type}
            </button>
          ))}
        </div>

        {loading && <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center text-sm text-white/60 backdrop-blur-xl">Loading events…</div>}
        {error && <p role="alert" className="mt-6 rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</p>}
        {!loading && !error && events.length === 0 && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center backdrop-blur-xl">
            <p className="font-display text-lg font-bold">No events yet</p>
            <p className="mt-1 text-sm text-white/60">Be the first person to create one.</p>
          </div>
        )}
        {!loading && !error && events.length > 0 && (
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">Around campus</p>
            <p className="text-xs font-semibold text-white/45">{filteredEvents.length} events</p>
          </div>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, index) => {
            const startsAt = new Date(event.startsAt);
            const featured = index === 0;
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`events-board-card group relative overflow-hidden rounded-[1.5rem] border border-white/15 bg-white/[0.08] p-4 text-white shadow-xl backdrop-blur-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${featured ? "sm:col-span-2 lg:col-span-2 sm:p-5" : ""}`}
                style={{ animationDelay: `${Math.min(index, 10) * 65}ms` }}
              >
                <div className="events-board-shine pointer-events-none absolute inset-0" />
                <div className="relative z-10 flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/80">{TYPE_ICONS[event.eventType] ?? "✨"} {event.eventType}</span>
                    <div className="flex items-center gap-2">
                      {featured && <span className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-rose-300 sm:inline">Next up</span>}
                      {event.joined && <span className="rounded-full bg-green-400/15 px-2.5 py-1 text-[10px] font-bold text-green-200">Joined</span>}
                    </div>
                  </div>

                  <div className={`mt-5 grid items-center gap-3 ${featured ? "sm:grid-cols-[64px_1fr]" : "grid-cols-[54px_1fr]"}`}>
                    <div className="rounded-xl bg-white px-2 py-2.5 text-center text-brand-900 shadow-lg">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-rose-500">{startsAt.toLocaleDateString("en-AU", { month: "short" })}</span>
                      <span className={`block font-display font-bold leading-none ${featured ? "text-3xl" : "text-2xl"}`}>{startsAt.getDate()}</span>
                    </div>
                    <div className="min-w-0">
                      <h2 className={`truncate font-display font-bold ${featured ? "text-xl sm:text-2xl" : "text-lg"}`}>{event.title}</h2>
                      <p className="mt-1 truncate text-xs text-white/55">{startsAt.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false })} · {event.location}</p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
                    <div>
                      <AvatarGroup people={event.attendees.map((attendee) => attendee.student)} max={featured ? 5 : 3} />
                      <p className="mt-1 text-[10px] text-white/50">{event.attendeeCount}/{event.capacity} going · {event.durationMinutes} min</p>
                    </div>
                    <p className="max-w-28 truncate text-right text-[10px] text-white/45">{event.creator ? `by ${event.creator.name}` : "Campus event"}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {!loading && !error && events.length > 0 && filteredEvents.length === 0 && (
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-5 py-8 text-center text-sm text-white/60">No {activeType.toLowerCase()} events yet.</div>
        )}
      </section>
    </main>
  );
}
