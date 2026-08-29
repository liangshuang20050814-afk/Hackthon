"use client";

// [Owner: C] Client-side hook that polls /api/messages for new messages.
// Deliberately simple (setInterval + fetch) instead of WebSockets — good
// enough for a hackathon demo with 2 people chatting live.
import { useCallback, useEffect, useState } from "react";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentUrl: string | null;
  attachmentName: string | null;
  attachmentType: string | null;
  sticker: string | null;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  sentAt: string;
}

const POLL_INTERVAL_MS = 2000;

export function useChatPolling(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const refreshMessages = useCallback(async () => {
    const res = await fetch(`/api/messages?conversationId=${encodeURIComponent(conversationId)}`);
    if (!res.ok) return;
    const data: ChatMessage[] = await res.json();
    setMessages(data);
  }, [conversationId]);

  useEffect(() => {
    refreshMessages();
    const interval = setInterval(refreshMessages, POLL_INTERVAL_MS);
    return () => {
      clearInterval(interval);
    };
  }, [refreshMessages]);

  return { messages, refreshMessages };
}
