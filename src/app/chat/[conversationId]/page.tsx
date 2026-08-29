// [Owner: C] Conversation thread — polls for new messages via
// useChatPolling and posts new ones to /api/messages.
"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useChatPolling } from "@/lib/polling/useChatPolling";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { Button } from "@/components/ui/Button";
import { getCurrentStudentId } from "@/lib/demo-user";

interface ConversationHeader {
  otherStudent: {
    name: string;
  };
}

const STICKERS = ["😊", "😂", "🔥", "💜", "🎉", "👍", "😭", "😎", "✨", "☕", "📚", "🏀"];
const CURRENT_STUDENT_ID = getCurrentStudentId();

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const { messages, refreshMessages } = useChatPolling(params.conversationId);
  const [conversation, setConversation] = useState<ConversationHeader | null>(null);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [imageAttachment, setImageAttachment] = useState<{
    url: string;
    name: string;
    type: string;
  } | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showStickers, setShowStickers] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(
      `/api/conversations?studentId=${CURRENT_STUDENT_ID}&conversationId=${encodeURIComponent(
        params.conversationId,
      )}`,
    )
      .then((res) => res.json())
      .then((data: ConversationHeader[]) => {
        setConversation(data[0] ?? null);
      });
  }, [params.conversationId]);

  async function sendMessage() {
    const text = draft.trim();
    if ((!text && !imageAttachment && !selectedSticker) || isSending) return;

    setIsSending(true);
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: params.conversationId,
        senderId: CURRENT_STUDENT_ID,
        text,
        attachmentUrl: imageAttachment?.url,
        attachmentName: imageAttachment?.name,
        attachmentType: imageAttachment?.type,
        sticker: selectedSticker,
      }),
    });
    setIsSending(false);

    if (!res.ok) return;

    setDraft("");
    setImageAttachment(null);
    setSelectedSticker(null);
    setShowStickers(false);
    refreshMessages();
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageAttachment({
          url: reader.result,
          name: file.name,
          type: file.type,
        });
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-3xl flex-col gap-4 px-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="min-w-0 truncate font-display text-xl font-bold text-ink">
          {conversation?.otherStudent.name ?? "Messages"}
        </h1>
        <Link
          href="/chat"
          className="shrink-0 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-brand-700 shadow-soft transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Back to messages
        </Link>
      </div>

      <div className="flex flex-1 flex-col gap-2 rounded-3xl border border-black/5 bg-white/70 p-4 shadow-soft">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === CURRENT_STUDENT_ID}
            onPreviewImage={(src, alt) => setPreviewImage({ src, alt })}
          />
        ))}
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-ink-muted">No messages yet. Start the conversation.</p>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
        className="flex flex-col gap-3"
      >
        {(imageAttachment || selectedSticker) && (
          <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-brand-100 bg-white/80 p-3 shadow-soft">
            {imageAttachment && (
              <button
                type="button"
                onClick={() =>
                  setPreviewImage({ src: imageAttachment.url, alt: imageAttachment.name })
                }
                className="group flex items-center gap-3 rounded-2xl bg-brand-50 p-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                <img
                  src={imageAttachment.url}
                  alt={imageAttachment.name}
                  className="h-14 w-14 rounded-xl object-cover"
                />
                <span className="max-w-48 truncate text-sm font-medium text-ink">
                  {imageAttachment.name}
                </span>
              </button>
            )}
            {selectedSticker && (
              <div className="rounded-2xl bg-brand-50 px-4 py-2 text-3xl">{selectedSticker}</div>
            )}
            <button
              type="button"
              onClick={() => {
                setImageAttachment(null);
                setSelectedSticker(null);
              }}
              className="ml-auto rounded-full px-3 py-1.5 text-sm font-semibold text-ink-muted hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            >
              Clear
            </button>
          </div>
        )}

        {showStickers && (
          <div className="grid grid-cols-6 gap-2 rounded-3xl border border-brand-100 bg-white/90 p-3 shadow-soft sm:w-fit">
            {STICKERS.map((sticker) => (
              <button
                key={sticker}
                type="button"
                onClick={() => {
                  setSelectedSticker(sticker);
                  setShowStickers(false);
                }}
                aria-label={`Send sticker ${sticker}`}
                className="flex h-11 w-11 items-center justify-center rounded-2xl text-2xl transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
              >
                {sticker}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="sr-only"
            aria-label="Upload image"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-soft transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Image
          </button>
          <button
            type="button"
            onClick={() => setShowStickers((value) => !value)}
            className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-brand-700 shadow-soft transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
          >
            Sticker
          </button>
          <label htmlFor="message-input" className="sr-only">
            Message
          </label>
          <input
            id="message-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="min-w-0 flex-1 rounded-full border border-brand-100 bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
            placeholder="Type a message..."
          />
          <Button
            type="submit"
            disabled={isSending || (!draft.trim() && !imageAttachment && !selectedSticker)}
          >
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
      </form>

      {previewImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-6"
          onClick={() => setPreviewImage(null)}
        >
          <div className="max-h-full max-w-4xl overflow-hidden rounded-3xl bg-white p-3 shadow-glass">
            <img
              src={previewImage.src}
              alt={previewImage.alt}
              className="max-h-[80vh] max-w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </main>
  );
}
