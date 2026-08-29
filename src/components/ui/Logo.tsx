// [Owner: D] Shared brand mark — used on the pre-auth screen (login) and
// in TopNav. Keep this the single source of truth instead of inlining the
// SVG wherever a logo is needed.
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18" stroke="url(#logo-ring)" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="11.5" stroke="url(#logo-ring)" strokeWidth="2.5" opacity="0.7" />
      <circle cx="20" cy="20" r="5" fill="url(#logo-ring)" />
      <defs>
        <linearGradient id="logo-ring" x1="2" y1="2" x2="38" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B7BF0" />
          <stop offset="1" stopColor="#4A3FC4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
