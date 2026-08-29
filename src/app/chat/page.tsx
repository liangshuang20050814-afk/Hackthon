"use client";

// [Owner: C] Conversation list for students already connected by match/friend
// actions. Replaces the placeholder card shown in the first chat pass.
import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { StudentAvatar } from "@/components/ui/StudentAvatar";
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
              <StudentAvatar
                name={conversation.otherStudent.name}
                avatarUrl={conversation.otherStudent.avatarUrl}
                size="lg"
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-AU", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
