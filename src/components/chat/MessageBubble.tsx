// [Owner: C] Single chat message bubble.
import type { ChatMessage } from "@/lib/polling/useChatPolling";
import { StudentAvatar } from "@/components/ui/StudentAvatar";

export function MessageBubble({
  message,
  isOwn,
  onPreviewImage,
}: {
  message: ChatMessage;
  isOwn: boolean;
  onPreviewImage?: (src: string, alt: string) => void;
}) {
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && <StudentAvatar name={message.sender.name} avatarUrl={message.sender.avatarUrl} size="sm" />}
      <div
        className={`flex max-w-[75%] flex-col gap-2 rounded-2xl px-3 py-2 text-sm ${
          isOwn ? "bg-brand text-white" : "bg-gray-100 text-gray-900"
        }`}
      >
        {message.sticker && <div className="text-4xl leading-none">{message.sticker}</div>}
        {message.attachmentUrl && (
          <button
            type="button"
            onClick={() =>
              onPreviewImage?.(
                message.attachmentUrl!,
                message.attachmentName ?? "Shared image",
              )
            }
            className="overflow-hidden rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            <img
              src={message.attachmentUrl}
              alt={message.attachmentName ?? "Shared image"}
              className="max-h-64 w-full object-cover"
            />
          </button>
        )}
        {message.body && <p>{message.body}</p>}
        <time
          dateTime={message.sentAt}
          className={`text-[11px] font-medium ${
            isOwn ? "text-white/75" : "text-ink-muted"
          }`}
        >
          {formatMessageTime(message.sentAt)}
        </time>
      </div>
      {isOwn && <StudentAvatar name={message.sender.name} avatarUrl={message.sender.avatarUrl} size="sm" />}
    </div>
  );
}

function formatMessageTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
