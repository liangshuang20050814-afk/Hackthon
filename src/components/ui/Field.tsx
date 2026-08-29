// [Owner: D] Labeled text input — shared by login and signup forms.
export function Field({
  id,
  label,
  type,
  autoComplete,
  placeholder,
  minLength,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        required
        minLength={minLength}
        className="rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        placeholder={placeholder}
      />
    </div>
  );
}
