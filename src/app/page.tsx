// [Owner: D] Landing page. Redirect logged-in users straight to /matches
// once login state exists — for the demo this can just link out manually.
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">UniMatch</h1>
      <p className="text-gray-600">Find classmates, get matched, chat, and go to events.</p>
      <Link href="/login" className="text-brand underline">
        Get started
      </Link>
    </main>
  );
}
