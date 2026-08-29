// [Owner: C] Conversation list. TODO [C]: fetch real conversations for the
// logged-in student from a GET /api/conversations route (not yet built).
import Link from "next/link";
import { Card } from "@/components/ui/Card";

export default function ChatListPage() {
  return (
    <main className="flex flex-col gap-3 p-6">
      <h1 className="text-xl font-bold">Messages</h1>
      {/* TODO [C]: map over real conversations */}
      <Link href="/chat/placeholder-conversation-id">
        <Card>Placeholder conversation</Card>
      </Link>
    </main>
  );
}
