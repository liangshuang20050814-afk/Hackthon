import { Card } from "@/components/ui/Card";
import { AvatarGroup } from "@/components/ui/AvatarGroup";

const TYPE_ICONS: Record<string, string> = {
  Sports: "⚽", Party: "🎉", Study: "📚", Social: "☕", Gaming: "🎮", Other: "✨",
};

interface EventCardProps {
  title: string;
  location: string;
  eventType: string;
  startsAt: string;
  durationMinutes: number;
  capacity: number;
  attendeeCount: number;
  joined: boolean;
  creator: { name: string } | null;
  attendees: { id: string; name: string; avatarUrl: string | null }[];
}

export function EventCard({
  title, location, eventType, startsAt, durationMinutes, capacity, attendeeCount, joined, creator, attendees,
}: EventCardProps) {
  return (
    <Card className="h-full transition hover:-translate-y-0.5 hover:shadow-glass">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
          {TYPE_ICONS[eventType] ?? "✨"} {eventType}
        </span>
        {joined && <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Joined</span>}
      </div>
      <h2 className="mt-3 font-display text-lg font-bold text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink-muted">{new Date(startsAt).toLocaleString("en-AU", { dateStyle: "medium", timeStyle: "short" })}</p>
      <p className="mt-1 text-sm text-ink-muted">{location} · {durationMinutes} min</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-brand-50 pt-3">
        <div><AvatarGroup people={attendees} /><p className="mt-1 text-xs text-ink-muted">{attendeeCount}/{capacity} going</p></div>
        {creator && <p className="max-w-32 truncate text-right text-xs text-ink-muted">by {creator.name}</p>}
      </div>
    </Card>
  );
}
