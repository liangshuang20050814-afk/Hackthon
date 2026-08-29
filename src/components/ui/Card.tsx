// [Owner: D] BUILD FIRST. Shared card primitive used by match results (A),
// classmate list (B), chat/event lists (C). Keep the prop surface small and
// generic so it fits all three use cases instead of forking per-feature.
import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Card({ children, onClick, className = "" }: CardProps) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`rounded-3xl border border-black/5 bg-white p-4 shadow-soft transition-all duration-200 ${
        onClick
          ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-glass focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
