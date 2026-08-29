// [Owner: C] Conversation thread — polls for new messages via
// useChatPolling and posts new ones to /api/messages.
"use client";

import { useState } from "react";
import { useChatPolling } from "@/lib/polling/useChatPolling";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Button } from "@/components/ui/Button";

// TODO [C]: use the real logged-in student id once login (D) exists.
const CURRENT_STUDENT_ID = "demo-student-1";

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const messages = useChatPolling(params.conversationId);
  const [draft, setDraft] = useState("");

  async function sendMessage() {
    if (!draft.trim()) return;
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: params.conversationId,
        senderId: CURRENT_STUDENT_ID,
        text: draft,
      }),
    });
    setDraft("");
  }

  return (
    <main className="flex flex-col gap-2 p-6">
      <div className="flex flex-1 flex-col gap-2">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === CURRENT_STUDENT_ID}
          />
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex gap-2"
      >
        <label htmlFor="message-input" className="sr-only">
          Message
        </label>
        <input
          id="message-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-1 rounded-full border border-gray-300 px-3 py-2"
          placeholder="Type a message..."
        />
        <Button type="submit">Send</Button>
      </form>
    </main>
  );
}
