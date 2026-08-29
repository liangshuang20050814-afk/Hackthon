// [Owner: D] Shared button. Keep accessible by default: visible focus ring
// and a real <button> element (not a styled <div>) so keyboard Tab + Enter
// works everywhere it's used without each feature owner re-solving it.
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "rounded-full px-5 py-2.5 font-semibold tracking-wide transition-all duration-200 " +
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 " +
    "focus-visible:outline-brand-600 disabled:opacity-50 disabled:pointer-events-none " +
    "active:scale-[0.98]";
  const variants = {
    // Indigo-violet gradient, ~92% opaque with a blur so it keeps a frosted
    // quality over the page wash, while staying dark enough for AA-safe
    // white text (gradient stays within brand-500..brand-700, all >= 4.8:1).
    primary:
      "bg-gradient-to-r from-brand-500/95 to-brand-700/95 text-white backdrop-blur-md " +
      "border border-white/15 shadow-glass hover:from-brand-600 hover:to-brand-800",
    // Light frosted glass — the "微透毛玻璃" surface.
    secondary:
      "bg-white/60 text-brand-700 backdrop-blur-md border border-white/80 " +
      "shadow-soft hover:bg-white/80",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
