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
      className={`rounded-2xl border border-gray-200 bg-white p-4 shadow-sm ${
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
