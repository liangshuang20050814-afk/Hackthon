interface StudentAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASSES = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-28 w-28 text-3xl",
};

export function studentInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return `${parts[0][0]}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

export function StudentAvatar({ name, avatarUrl, size = "md", className = "" }: StudentAvatarProps) {
  const classes = `${SIZE_CLASSES[size]} shrink-0 rounded-full object-cover shadow-soft ${className}`;

  // avatarUrl was declared in the props type but never read here, so every
  // avatar rendered through this component (TopNav, AvatarGroup, the
  // profile page) always showed a generated purple placeholder — even for
  // students with a real uploaded photo or a differently-colored generated
  // avatar already saved. Render the real image when there is one.
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={classes} />;
  }

  return (
    <div
      role="img"
      aria-label={name}
      className={`${classes} flex items-center justify-center bg-gradient-to-br from-brand-400 to-brand-700 font-display font-bold text-white`}
    >
      {studentInitials(name)}
    </div>
  );
}
