// [Owner: D] Shared button. Keep accessible by default: visible focus ring
// and a real <button> element (not a styled <div>) so keyboard Tab + Enter
// works everywhere it's used without each feature owner re-solving it.
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const base =
    "rounded-full px-4 py-2 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50";
  const variants = {
    primary: "bg-brand text-white hover:bg-brand-dark",
    secondary: "bg-brand-light text-brand-dark hover:bg-brand/10",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
