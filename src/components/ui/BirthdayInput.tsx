"use client";

import { useState } from "react";

// [Owner: D] Native <input type="date"> renders its placeholder/format
// using the browser's OS-level locale, not the page's `lang` — on a
// Chinese-locale browser that shows up as "yyyy/mm/日", and none of it is
// stylable since it's browser chrome, not DOM we control. Three plain
// <select>s sidestep the whole problem: always English, always styled to
// match the rest of the form.
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function daysInMonth(month: number, year: number) {
  if (!month) return 31;
  return new Date(year || 2000, month, 0).getDate();
}

const selectClass =
  "rounded-xl border border-brand-100 bg-white px-2.5 py-2.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

export function BirthdayInput({
  value,
  onChange,
  className = "",
}: {
  value: string; // "YYYY-MM-DD" or ""
  onChange: (value: string) => void;
  className?: string;
}) {
  // Local state, seeded once from `value` — NOT re-derived from it on every
  // render. Only the composed string is cleared while a selection is
  // incomplete (e.g. month picked but not year yet); if the three <select>s
  // read straight from `value` instead, that clearing would immediately
  // reset the month back to blank the moment it's chosen.
  const initial = value ? value.split("-") : ["", "", ""];
  const [y, setY] = useState(initial[0] ?? "");
  const [m, setM] = useState(initial[1] ?? "");
  const [d, setD] = useState(initial[2] ?? "");

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear - i);
  const days = Array.from({ length: daysInMonth(m ? Number(m) : 0, y ? Number(y) : currentYear) }, (_, i) => i + 1);

  function update(nextY: string, nextM: string, nextD: string) {
    const maxDay = daysInMonth(nextM ? Number(nextM) : 0, nextY ? Number(nextY) : currentYear);
    const clampedD = nextD && Number(nextD) > maxDay ? String(maxDay).padStart(2, "0") : nextD;
    setY(nextY);
    setM(nextM);
    setD(clampedD);
    onChange(nextY && nextM && clampedD ? `${nextY}-${nextM}-${clampedD}` : "");
  }

  return (
    <div className={`grid grid-cols-3 gap-2 ${className}`}>
      <select aria-label="Birth day" value={d} onChange={(e) => update(y, m, e.target.value)} className={selectClass}>
        <option value="">Day</option>
        {days.map((day) => (
          <option key={day} value={String(day).padStart(2, "0")}>
            {day}
          </option>
        ))}
      </select>
      <select aria-label="Birth month" value={m} onChange={(e) => update(y, e.target.value, d)} className={selectClass}>
        <option value="">Month</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={String(i + 1).padStart(2, "0")}>
            {label}
          </option>
        ))}
      </select>
      <select aria-label="Birth year" value={y} onChange={(e) => update(e.target.value, m, d)} className={selectClass}>
        <option value="">Year</option>
        {years.map((yr) => (
          <option key={yr} value={String(yr)}>
            {yr}
          </option>
        ))}
      </select>
    </div>
  );
}
