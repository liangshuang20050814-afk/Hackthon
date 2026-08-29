"use client";

// [Owner: C] Conversation list for students already connected by match/friend
// actions. Replaces the placeholder card shown in the first chat pass.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getCurrentStudentId } from "@/lib/demo-user";

const CURRENT_STUDENT_ID = getCurrentStudentId();

interface ConversationListItem {
  id: string;
  otherStudent: {
    id: string;
    name: string;
    avatarUrl: string | null;
    faculty: string;
    yearOfStudy: number;
  };
  lastMessage: {
    body: string;
    sentAt: string;
  } | null;
  updatedAt: string;
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/conversations?studentId=${CURRENT_STUDENT_ID}`)
      .then((res) => res.json())
      .then(setConversations)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 py-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Messages</h1>
        <p className="text-sm text-ink-muted">Chats opened from your matches and classmates.</p>
      </div>

      {isLoading && <ConversationSkeleton />}

      {!isLoading && conversations.length === 0 && (
        <Card>
          <p className="text-sm text-ink-muted">
            No chats yet. Open a classmate profile and tap Message to start one.
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {conversations.map((conversation) => (
          <Link key={conversation.id} href={`/chat/${conversation.id}`}>
            <Card className="flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-glass">
              <Avatar
                name={conversation.otherStudent.name}
                avatarUrl={conversation.otherStudent.avatarUrl}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate font-semibold text-ink">{conversation.otherStudent.name}</p>
                  <time className="shrink-0 text-xs font-medium text-ink-muted">
                    {formatTime(conversation.updatedAt)}
                  </time>
                </div>
                <p className="text-xs text-ink-muted">
                  {conversation.otherStudent.faculty} · Year {conversation.otherStudent.yearOfStudy}
                </p>
                <p className="mt-1 truncate text-sm text-ink-muted">
                  {conversation.lastMessage?.body ?? "Say hi and start the chat."}
                </p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className="h-12 w-12 rounded-full object-cover" />;
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-sm font-bold text-white shadow-soft">
      {initialsOf(name)}
    </div>
  );
}

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading conversations">
      {[0, 1].map((item) => (
        <Card key={item} className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-brand-100" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-32 rounded-full bg-brand-100" />
            <div className="h-3 w-56 rounded-full bg-brand-50" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
