// [Owner: D] Overlapping avatar stack — used for "N classmates" (B) and
// "N attending" (C's event cards). Every avatar needs real alt text
// (student name), never a decorative empty alt, for the accessibility pass.
import { StudentAvatar } from "./StudentAvatar";

interface AvatarGroupProps {
  people: { id: string; name: string; avatarUrl: string | null }[];
  max?: number;
}

export function AvatarGroup({ people, max = 4 }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((person, i) => (
        <div key={person.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <StudentAvatar name={person.name} avatarUrl={person.avatarUrl} size="sm" className="border-2 border-white ring-1 ring-brand-100" />
        </div>
      ))}
      {overflow > 0 && <span className="ml-1 text-sm text-ink-muted">+{overflow}</span>}
    </div>
  );
}
