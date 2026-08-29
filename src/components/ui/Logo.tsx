// [Owner: D] Shared brand mark — used on the pre-auth screen (login) and
// in TopNav. Keep this the single source of truth instead of inlining the
// SVG wherever a logo is needed. Concentric-ring "radar" mark, light blue
// outer rings deepening to navy at the center.
export function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="32" r="30" stroke="#C7D9F4" strokeWidth="2.6" />
      <circle cx="32" cy="32" r="25.2" stroke="#A9C3ED" strokeWidth="2.6" />
      <circle cx="32" cy="32" r="20.4" stroke="#8AACE3" strokeWidth="2.6" />
      <circle cx="32" cy="32" r="15.6" stroke="#6B93D6" strokeWidth="2.6" />
      <circle cx="32" cy="32" r="10.8" stroke="#4C79C4" strokeWidth="2.6" />
      <circle cx="32" cy="32" r="4.5" fill="#2A4A8C" />
    </svg>
  );
}
