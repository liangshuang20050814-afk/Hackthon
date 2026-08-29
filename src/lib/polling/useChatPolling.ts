"use client";

// [Owner: C] Client-side hook that polls /api/messages for new messages.
// Deliberately simple (setInterval + fetch) instead of WebSockets — good
// enough for a hackathon demo with 2 people chatting live.
import { useEffect, useState } from "react";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  sentAt: string;
}

const POLL_INTERVAL_MS = 2000;

export function useChatPolling(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchMessages() {
      // TODO [C]: implement GET /api/messages?conversationId=... route.
      const res = await fetch(`/api/messages?conversationId=${conversationId}`);
      if (!res.ok || cancelled) return;
      const data: ChatMessage[] = await res.json();
      if (!cancelled) setMessages(data);
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [conversationId]);

  return messages;
}
