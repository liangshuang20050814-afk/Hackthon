// [Owner: C] Event summary card for the events list page.
import { Card } from "@/components/ui/Card";
import { AvatarGroup } from "@/components/ui/AvatarGroup";

interface EventCardProps {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  attendees: { id: string; name: string; avatarUrl: string | null }[];
}

export function EventCard({ title, location, startsAt, attendees }: EventCardProps) {
  return (
    <Card className="flex flex-col gap-2">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-gray-600">
        {location} · {new Date(startsAt).toLocaleString()}
      </p>
      <AvatarGroup people={attendees} />
    </Card>
  );
}
