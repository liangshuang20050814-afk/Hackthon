// [Owner: D] Overlapping avatar stack — used for "N classmates" (B) and
// "N attending" (C's event cards). Every avatar needs real alt text
// (student name), never a decorative empty alt, for the accessibility pass.
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
        <img
          key={person.id}
          src={person.avatarUrl ?? "/avatars/placeholder.png"}
          alt={person.name}
          className="h-8 w-8 rounded-full border-2 border-white object-cover"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        />
      ))}
      {overflow > 0 && (
        <span className="ml-1 text-sm text-gray-500">+{overflow}</span>
      )}
    </div>
  );
}
