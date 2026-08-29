// [Owner: D] Shared shell for the pre-auth screens (login, signup): one
// full-bleed background image behind everything, brand + tagline floating
// on the left, the page's own card (its form, as children) floating on
// the right. Deliberately NOT a hard-split two-panel layout — the
// reference mockup has both sides sharing the same background, not a
// separate opaque image panel.
import { Logo } from "@/components/ui/Logo";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main
      className="flex min-h-screen items-center bg-cover bg-center px-6 py-12 sm:px-12 lg:px-20"
      style={{ backgroundImage: "url(/background.png)" }}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center gap-14 lg:flex-row lg:gap-20">
        <div className="flex max-w-lg flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <div className="flex items-center gap-4">
            <Logo size={112} />
            <span className="mt-3 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 bg-clip-text font-display text-6xl font-bold tracking-tight text-transparent sm:text-7xl">
              UniSoul
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-ink sm:text-4xl">
            UniSoul highlight the shared block
          </h1>
          <p className="text-lg text-ink-muted">Find it, highlight it.</p>
        </div>

        {children}
      </div>
    </main>
  );
}
