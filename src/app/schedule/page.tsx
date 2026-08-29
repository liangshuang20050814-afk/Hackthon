// [Owner: B] Manual course entry + .ics upload. This is the most
// demo-critical flow — expect this page to get the most screen time in the
// video, per ARCHITECTURE.md.
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function SchedulePage() {
  const [file, setFile] = useState<File | null>(null);

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    // TODO [B]: use the real logged-in student id.
    formData.append("studentId", "demo-student-1");
    await fetch("/api/schedule/upload", { method: "POST", body: formData });
  }

  return (
    <main className="flex flex-col gap-4 p-6">
      <h1 className="text-xl font-bold">Your timetable</h1>

      {/* TODO [B]: manual course-entry form (course code autocomplete +
          day/time picker) as an alternative to ICS upload. */}

      <label htmlFor="ics-file" className="text-sm font-medium">
        Upload your .ics timetable export
      </label>
      <input
        id="ics-file"
        type="file"
        accept=".ics"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <Button onClick={handleUpload} disabled={!file}>
        Upload
      </Button>
    </main>
  );
}
