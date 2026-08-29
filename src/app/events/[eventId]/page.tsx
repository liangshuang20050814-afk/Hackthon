// [Owner: C] Event detail + join button. No edit/delete/create — judges
// only ever browse and join.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

// TODO [C]: use the real logged-in student id once login (D) exists.
const CURRENT_STUDENT_ID = "demo-student-1";

export default function EventDetailPage({ params }: { params: { eventId: string } }) {
  const [joined, setJoined] = useState(false);

  async function handleJoin() {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId: params.eventId, studentId: CURRENT_STUDENT_ID }),
    });
    setJoined(true);
  }

  return (
    <main className="flex flex-col gap-4 p-6">
      {/* TODO [C]: fetch and render real event details (GET /api/events/:id) */}
      <h1 className="text-xl font-bold">Event details</h1>
      <Button onClick={handleJoin} disabled={joined}>
        {joined ? "You're going!" : "Join event"}
      </Button>
    </main>
  );
}
