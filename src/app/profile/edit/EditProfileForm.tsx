"use client";

import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { BirthdayInput } from "@/components/ui/BirthdayInput";
import {
  AVATAR_SWATCHES,
  BIO_MAX,
  FACULTIES,
  GENDERS,
  INTERESTS,
  MBTI_TYPES,
  MIN_INTERESTS,
  YEARS,
  fileToSquareDataUrl,
  generateInitialsAvatar,
  initialsOf,
} from "@/lib/profileForm";

interface EditableStudent {
  id: string;
  name: string;
  avatarUrl: string | null;
  faculty: string;
  yearOfStudy: number;
  major: string;
  birthday: string; // "YYYY-MM-DD" or ""
  gender: string | null;
  mbti: string;
  bio: string;
  interests: string[];
}

const inputClass =
  "rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-700">{children}</h2>;
}

export function EditProfileForm({ student }: { student: EditableStudent }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(student.name);
  // Whatever avatarUrl already is (an uploaded photo or a previously
  // generated initials avatar) — treat it as the current preview. Only
  // regenerate a fresh initials avatar if this is cleared to null and never
  // replaced.
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(student.avatarUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [avatarColor, setAvatarColor] = useState(AVATAR_SWATCHES[0].id);
  const [faculty, setFaculty] = useState(student.faculty);
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(student.yearOfStudy);
  const [major, setMajor] = useState(student.major);
  const [birthday, setBirthday] = useState(student.birthday);
  const [gender, setGender] = useState<string | null>(student.gender);
  const [mbti, setMbti] = useState(student.mbti);
  const [bio, setBio] = useState(student.bio);
  const [interests, setInterests] = useState<string[]>(student.interests);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swatch = AVATAR_SWATCHES.find((s) => s.id === avatarColor)!;

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please choose an image file.");
      return;
    }
    try {
      setPhotoDataUrl(await fileToSquareDataUrl(file));
      setPhotoError(null);
    } catch {
      setPhotoError("Couldn't read that photo — try a different file.");
    }
  }

  function toggleInterest(label: string) {
    setInterests((prev) => (prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]));
  }

  const formValid = name.trim().length > 0 && faculty !== "" && yearOfStudy !== null && interests.length >= MIN_INTERESTS;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formValid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const avatarUrl = photoDataUrl || generateInitialsAvatar(name, swatch.hexFrom, swatch.hexTo);
      const res = await fetch(`/api/students/${student.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, faculty, yearOfStudy, bio, interests, avatarUrl, major, birthday, gender, mbti }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      router.push(`/profile/${student.id}`);
    } catch {
      setError("Something went wrong saving your profile — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-surface flex flex-col gap-10 rounded-[2rem] px-8 py-10 sm:px-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Edit profile</h1>
        <p className="mt-1 text-sm text-ink-muted">Update what classmates see about you.</p>
      </div>

      {/* Landscape layout: a fixed-width left column (square avatar panel +
          bio underneath it) and a 3-column field grid on the right — keeps
          the page a wide card instead of one long vertical scroll.
          items-start so the left column doesn't stretch to match the
          taller fields column. Stacks back to a single column below md. */}
      <div className="grid gap-8 md:grid-cols-[260px_1fr] md:items-start">
        <div className="flex flex-col gap-6">
          <div className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 p-6">
            {photoDataUrl ? (
              <img src={photoDataUrl} alt="Your profile photo" className="h-28 w-28 rounded-full object-cover shadow-soft" />
            ) : (
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br ${swatch.from} ${swatch.to} text-3xl font-bold text-white shadow-soft`}
              >
                {initialsOf(name)}
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="sr-only"
                aria-label="Upload profile photo"
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm font-semibold text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  {photoDataUrl ? "Change photo" : "Upload photo"}
                </button>
                {photoDataUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoDataUrl(null)}
                    className="text-sm text-ink-muted hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                  >
                    Remove
                  </button>
                )}
              </div>
              {photoError && <p className="text-xs text-rose-600">{photoError}</p>}

              {!photoDataUrl && (
                <div className="flex gap-2">
                  {AVATAR_SWATCHES.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-label={`Use ${s.id} avatar color`}
                      aria-pressed={avatarColor === s.id}
                      onClick={() => setAvatarColor(s.id)}
                      className={`h-6 w-6 rounded-full bg-gradient-to-br ${s.from} ${s.to} transition-transform ${
                        avatarColor === s.id ? "ring-2 ring-brand-600 ring-offset-2 ring-offset-white" : "hover:scale-110"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium text-ink">
              Bio
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
              rows={6}
              className={`resize-none ${inputClass}`}
              placeholder="Second-year comp sci, always down for a coffee and a debugging rant."
            />
            <span className="self-end text-xs text-ink-muted">
              {bio.length}/{BIO_MAX}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <SectionHeading>Basic info</SectionHeading>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-ink">
                Full name
              </label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="faculty" className="text-sm font-medium text-ink">
                Faculty
              </label>
              <select id="faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} className={inputClass}>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="major" className="text-sm font-medium text-ink">
                Major
              </label>
              <input
                id="major"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className={inputClass}
                placeholder="e.g. Computer Science"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-3">
            <span className="text-sm font-medium text-ink">Year of study</span>
            <div className="flex flex-wrap gap-2">
              {YEARS.map((y) => (
                <Chip key={y.value} label={y.label} selected={yearOfStudy === y.value} onClick={() => setYearOfStudy(y.value)} />
              ))}
            </div>
          </div>

          <div className="border-t border-brand-100 pt-6">
            <SectionHeading>More about you</SectionHeading>

            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-ink">Birthday</span>
                <BirthdayInput value={birthday} onChange={setBirthday} />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="mbti" className="text-sm font-medium text-ink">
                  MBTI
                </label>
                <select id="mbti" value={mbti} onChange={(e) => setMbti(e.target.value)} className={inputClass}>
                  <option value="">Prefer not to say</option>
                  {MBTI_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <span className="text-sm font-medium text-ink">Gender</span>
                <div className="flex flex-wrap gap-2">
                  {GENDERS.map((g) => (
                    <Chip key={g} label={g} selected={gender === g} onClick={() => setGender(gender === g ? null : g)} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 border-t border-brand-100 pt-8">
        <SectionHeading>Interests</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {INTERESTS.map((label) => (
            <Chip key={label} label={label} selected={interests.includes(label)} onClick={() => toggleInterest(label)} />
          ))}
        </div>
        <p className="text-xs text-ink-muted">
          {interests.length}/{MIN_INTERESTS} minimum selected
        </p>
      </div>

      {error && <p className="text-sm text-rose-600">{error}</p>}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.push(`/profile/${student.id}`)} className="sm:w-40">
          Cancel
        </Button>
        <Button type="submit" disabled={!formValid || submitting} className="sm:w-40">
          {submitting ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
