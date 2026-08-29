// [Owner: D] Overlapping avatar stack — used for "N classmates" (B) and
// "N attending" (C's event cards). Every avatar needs real alt text
// (student name), never a decorative empty alt, for the accessibility pass.
interface AvatarGroupProps {
  people: { id: string; name: string; avatarUrl: string | null }[];
  max?: number;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

// No placeholder image asset exists (public/avatars/ is still empty — see
// its README), so anyone without an avatarUrl gets a gradient-initials
// circle instead of a broken <img>.
function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const className = "h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-brand-100";
  if (avatarUrl) return <img src={avatarUrl} alt={name} className={className} />;
  return (
    <div
      className={`${className} flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-600 text-[10px] font-bold text-white`}
    >
      {initialsOf(name)}
    </div>
  );
}

export function AvatarGroup({ people, max = 4 }: AvatarGroupProps) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((person, i) => (
        <div key={person.id} style={{ marginLeft: i === 0 ? 0 : -8 }}>
          <Avatar name={person.name} avatarUrl={person.avatarUrl} />
        </div>
      ))}
      {overflow > 0 && <span className="ml-1 text-sm text-ink-muted">+{overflow}</span>}
    </div>
  );
}
