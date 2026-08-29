// [Owner: B] Renders a weekly grid of a student's Enrollment rows.
// Use the design tokens from tailwind.config.ts (brand colors), not raw hex,
// so this matches D's shared components.
interface Session {
  courseCode: string;
  dayOfWeek: number; // 0 = Monday
  startTime: string;
  endTime: string;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TimetableGrid({ sessions }: { sessions: Session[] }) {
  // TODO [B]: real grid layout (hour rows x day columns). This is a
  // placeholder list view so the route renders something immediately.
  return (
    <div className="grid grid-cols-7 gap-2">
      {DAY_LABELS.map((label, day) => (
        <div key={label}>
          <h3 className="text-sm font-semibold">{label}</h3>
          {sessions
            .filter((s) => s.dayOfWeek === day)
            .map((s, i) => (
              <div key={i} className="mt-1 rounded bg-brand-light p-1 text-xs">
                {s.courseCode}
                <br />
                {s.startTime}-{s.endTime}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
