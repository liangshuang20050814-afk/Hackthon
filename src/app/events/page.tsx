"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";

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

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-600">Campus life</p>
          <h1 className="mt-1 font-display text-3xl font-bold text-ink">Events</h1>
          <p className="mt-1 text-sm text-ink-muted">Create something fun or join what other students are planning.</p>
        </div>
        <Link href="/events/create" className="rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-5 py-2.5 font-semibold text-white shadow-glass hover:from-brand-600 hover:to-brand-800">
          + Create event
        </Link>
      </div>

      {loading && <p className="mt-8 text-sm text-ink-muted">Loading events…</p>}
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && events.length === 0 && (
        <div className="glass-surface mt-7 rounded-3xl px-6 py-12 text-center">
          <p className="font-display text-lg font-bold text-ink">No events yet</p>
          <p className="mt-1 text-sm text-ink-muted">Be the first person to create one.</p>
        </div>
      )}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`} className="rounded-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600">
            <EventCard {...event} attendees={event.attendees.map((attendee) => attendee.student)} />
          </Link>
        ))}
      </div>
    </main>
  );
}
