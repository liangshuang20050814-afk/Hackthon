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
      {/* Wider than the card needs, and a tighter gap than before, purely to
          give the slogan enough room to sit on one line each from xl up —
          at the old max-w-4xl the text column was only ~368px, which forced
          both lines to wrap however small the type got. */}
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-14 lg:flex-row lg:gap-16">
        <div className="flex max-w-lg flex-col items-center gap-6 text-center lg:max-w-xl lg:items-start lg:text-left">
          <div className="flex items-center gap-4">
            <Logo size={112} />
            <span className="mt-3 bg-gradient-to-r from-brand-500 via-brand-600 to-brand-800 bg-clip-text font-display text-6xl font-bold tracking-tight text-transparent sm:text-7xl">
              UniSoul
            </span>
          </div>
          {/* Two coordinate statements, not a headline plus supporting copy —
              so they're deliberately given identical type. The turn between
              them is carried by colour and by the second line's indent,
              never by size. Type and motion live in .auth-slogan* in
              globals.css. Both lines sit in one <h1> so the pair still reads
              as a single heading to screen readers. */}
          <h1 className="flex flex-col items-center gap-5 lg:items-start">
            {/* nowrap only from xl: below that the column genuinely isn't
                wide enough, and forcing one line there would overflow
                instead of wrapping. text-balance keeps the wrapped case
                even. */}
            <span className="auth-slogan auth-slogan-1 text-balance text-[1.6rem] text-ink sm:text-[1.85rem] xl:whitespace-nowrap">
              We can feel displaced in the crowd
            </span>

            {/* Indented only from lg, where the block is left-aligned — below
                that it's centred and an indent would just look like a
                mistake. */}
            <span className="auth-slogan auth-slogan-2 text-balance text-[1.6rem] sm:text-[1.85rem] lg:ml-12 xl:whitespace-nowrap">
              UniSoul is where real connections begin
            </span>
          </h1>
        </div>

        {children}
      </div>
    </main>
  );
}
