// [Owner: C] Event list — no creation flow, seed.ts (A) is the only source
// of events. This is the lightest of the 3 features; finish it first, then
// go help B with the schedule/classmates flow (see README.md).
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EventCard } from "@/components/events/EventCard";

interface EventListItem {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  attendees: { studentId: string }[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventListItem[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  return (
    <main className="flex flex-col gap-3 p-6">
      <h1 className="text-xl font-bold">Events</h1>
      {events.map((event) => (
        <Link key={event.id} href={`/events/${event.id}`}>
          {/* TODO [C]: resolve attendee ids to {id, name, avatarUrl} via
              /api/students before passing to EventCard's AvatarGroup. */}
          <EventCard {...event} attendees={[]} />
        </Link>
      ))}
    </main>
  );
}
