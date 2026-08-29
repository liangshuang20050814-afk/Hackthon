"use client";

// [Owner: D] Profile setup — shown once, right after sign up (see
// login/page.tsx). Existing users skip this entirely and land on /matches
// directly. Collects exactly the fields the matching engine and profile
// page need (see prisma/schema.prisma Student model + lib/types.ts):
// name, faculty, yearOfStudy, bio, interests, plus a few optional
// "about me" fields (major, birthday, gender, MBTI) that are profile color
// only — not part of the MatchReason contract. Free time isn't asked
// here — it's derived from the timetable entered on /schedule afterwards,
// not something to hand-collect during onboarding.
import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  setCurrentStudentIdCookie,
} from "@/lib/profileForm";

const TOTAL_STEPS = 4;

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [avatarColor, setAvatarColor] = useState(AVATAR_SWATCHES[0].id);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [faculty, setFaculty] = useState("");
  const [yearOfStudy, setYearOfStudy] = useState<number | null>(null);
  const [major, setMajor] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [mbti, setMbti] = useState("");
  const [bio, setBio] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swatch = AVATAR_SWATCHES.find((s) => s.id === avatarColor)!;

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
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
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  }

  const step1Valid = name.trim().length > 0 && faculty !== "" && yearOfStudy !== null;
  const step4Valid = interests.length >= MIN_INTERESTS;

  function goNext() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }
  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleFinish(e: FormEvent) {
    e.preventDefault();
    if (!step4Valid || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const avatarUrl = photoDataUrl || generateInitialsAvatar(name, swatch.hexFrom, swatch.hexTo);
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          faculty,
          yearOfStudy,
          bio,
          interests,
          avatarUrl,
          major,
          birthday,
          gender,
          mbti,
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      const created = await res.json();
      setCurrentStudentIdCookie(created.id);
      router.push("/matches");
    } catch {
      setError("Something went wrong saving your profile — please try again.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="glass-surface flex flex-col gap-6 rounded-[2rem] px-8 py-10">
        <div className="flex flex-col gap-2">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${
                  i < step ? "bg-gradient-to-r from-brand-500 to-brand-700" : "bg-brand-100"
                }`}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-ink-muted">
            Step {step} of {TOTAL_STEPS}
          </p>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="font-display text-xl font-bold text-ink">The basics</h1>
              <p className="mt-1 text-sm text-ink-muted">
                This is what classmates see first on your card.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3">
              {photoDataUrl ? (
                <img
                  src={photoDataUrl}
                  alt="Your uploaded profile photo"
                  className="h-20 w-20 rounded-full object-cover shadow-soft"
                />
              ) : (
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${swatch.from} ${swatch.to} text-2xl font-bold text-white shadow-soft`}
                >
                  {initialsOf(name)}
                </div>
              )}

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
                      className={`h-7 w-7 rounded-full bg-gradient-to-br ${s.from} ${s.to} transition-transform ${
                        avatarColor === s.id
                          ? "ring-2 ring-brand-600 ring-offset-2 ring-offset-white"
                          : "hover:scale-110"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="name" className="text-sm font-medium text-ink">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                placeholder="Alex Chen"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="faculty" className="text-sm font-medium text-ink">
                Faculty
              </label>
              <select
                id="faculty"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <option value="" disabled>
                  Select your faculty
                </option>
                {FACULTIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Year of study</span>
              <div className="flex flex-wrap gap-2">
                {YEARS.map((y) => (
                  <Chip
                    key={y.value}
                    label={y.label}
                    selected={yearOfStudy === y.value}
                    onClick={() => setYearOfStudy(y.value)}
                  />
                ))}
              </div>
            </div>

            <Button type="button" disabled={!step1Valid} onClick={goNext} className="mt-2">
              Next
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="font-display text-xl font-bold text-ink">A bit more about you</h1>
              <p className="mt-1 text-sm text-ink-muted">All optional — skip anything you'd rather not share.</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="major" className="text-sm font-medium text-ink">
                Major
              </label>
              <input
                id="major"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                placeholder="e.g. Computer Science"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Birthday</span>
              <BirthdayInput value={birthday} onChange={setBirthday} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink">Gender</span>
              <div className="flex flex-wrap gap-2">
                {GENDERS.map((g) => (
                  <Chip key={g} label={g} selected={gender === g} onClick={() => setGender(gender === g ? null : g)} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="mbti" className="text-sm font-medium text-ink">
                MBTI
              </label>
              <select
                id="mbti"
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
                className="rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <option value="">Prefer not to say</option>
                {MBTI_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={goBack} className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={goNext} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div>
              <h1 className="font-display text-xl font-bold text-ink">Say a little about you</h1>
              <p className="mt-1 text-sm text-ink-muted">
                Optional, but profiles with a bio get more matches.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-sm font-medium text-ink">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX))}
                rows={4}
                className="resize-none rounded-xl border border-brand-100 bg-white px-3.5 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                placeholder="Second-year comp sci, always down for a coffee and a debugging rant."
              />
              <span className="self-end text-xs text-ink-muted">
                {bio.length}/{BIO_MAX}
              </span>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={goBack} className="flex-1">
                Back
              </Button>
              <Button type="button" onClick={goNext} className="flex-1">
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <form onSubmit={handleFinish} className="flex flex-col gap-5">
            <div>
              <h1 className="font-display text-xl font-bold text-ink">What are you into?</h1>
              <p className="mt-1 text-sm text-ink-muted">
                Pick at least {MIN_INTERESTS} — this is what the matching engine leans on most.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((label) => (
                <Chip
                  key={label}
                  label={label}
                  selected={interests.includes(label)}
                  onClick={() => toggleInterest(label)}
                />
              ))}
            </div>
            <p className="text-xs text-ink-muted">
              {interests.length}/{MIN_INTERESTS} minimum selected
            </p>

            {error && <p className="text-sm text-rose-600">{error}</p>}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={goBack} className="flex-1">
                Back
              </Button>
              <Button type="submit" disabled={!step4Valid || submitting} className="flex-1">
                {submitting ? "Saving..." : "Finish"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
