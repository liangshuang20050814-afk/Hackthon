// [Owner: D] Shared brand mark — used on the pre-auth screens (login,
// signup) and in TopNav. Backed by the real asset at public/logo.png
// rather than a hand-drawn approximation, so it matches exactly.
export function Logo({ size = 40 }: { size?: number }) {
  return <img src="/logo.png" alt="" width={size} height={size} className="shrink-0" />;
}
