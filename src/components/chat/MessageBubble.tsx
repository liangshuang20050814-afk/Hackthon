// [Owner: C] Single chat message bubble.
import type { ChatMessage } from "@/lib/polling/useChatPolling";

export function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
          isOwn ? "bg-brand text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        {message.body}
      </div>
    </div>
  );
}
