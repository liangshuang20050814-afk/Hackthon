// [Owner: D] Selectable pill button — used for single/multi-select option
// lists (year of study, gender, interests) in onboarding and profile edit.
export function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
        selected
          ? "border-transparent bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-soft"
          : "border-brand-100 bg-white text-ink-muted hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {label}
    </button>
  );
}
