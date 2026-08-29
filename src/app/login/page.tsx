// [Owner: D] Login page. For a hackathon demo, this can be a fake login
// that just picks one of the seeded students — no real auth needed.
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  return (
    <main className="flex flex-col gap-4 p-8">
      <h1 className="text-xl font-bold">Log in</h1>
      {/* TODO [D]: replace with a picker over seeded students for the demo */}
      <form className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-medium">
          University email
        </label>
        <input
          id="email"
          type="email"
          className="rounded-lg border border-gray-300 px-3 py-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
          placeholder="you@uni.sydney.edu.au"
        />
        <Button type="submit">Continue</Button>
      </form>
    </main>
  );
}
