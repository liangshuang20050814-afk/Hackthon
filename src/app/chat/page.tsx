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

interface FriendRequestItem {
  id: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatarUrl: string | null;
    faculty: string;
    major: string | null;
    yearOfStudy: number;
    mbti: string | null;
  };
}

export default function ChatListPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [requestsOpen, setRequestsOpen] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  async function loadChatData() {
    const [conversationResponse, requestsResponse] = await Promise.all([
      fetch(`/api/conversations?studentId=${CURRENT_STUDENT_ID}`, { cache: "no-store" }),
      fetch("/api/friend-requests", { cache: "no-store" }),
    ]);
    if (conversationResponse.ok) setConversations(await conversationResponse.json());
    if (requestsResponse.ok) setFriendRequests(await requestsResponse.json());
    setIsLoading(false);
  }

  useEffect(() => { void loadChatData(); }, []);

  async function respondToRequest(requestId: string, action: "accept" | "decline") {
    setRespondingId(requestId);
    setRequestError(null);
    try {
      const response = await fetch("/api/friend-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, requestId }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not update this request.");
      setFriendRequests((current) => current.filter((item) => item.id !== requestId));
      if (action === "accept") {
        const conversationsResponse = await fetch(`/api/conversations?studentId=${CURRENT_STUDENT_ID}`, { cache: "no-store" });
        if (conversationsResponse.ok) setConversations(await conversationsResponse.json());
      }
    } catch (responseError) {
      setRequestError(responseError instanceof Error ? responseError.message : "Could not update this request.");
    } finally {
      setRespondingId(null);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-6 py-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">Messages</h1>
        <button
          type="button"
          onClick={() => setRequestsOpen(true)}
          className="relative inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/75 px-4 py-2 text-sm font-semibold text-brand-700 shadow-soft transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        >
          Friend requests
          {friendRequests.length > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white shadow-sm">{friendRequests.length}</span>
          )}
        </button>
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

      {requestsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/35 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="friend-requests-title" onClick={() => setRequestsOpen(false)}>
          <div className="friend-request-modal w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/80 bg-background/95 p-5 shadow-glass backdrop-blur-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="friend-requests-title" className="font-display text-2xl font-bold text-ink">Friend requests</h2>
                <p className="mt-1 text-sm text-ink-muted">{friendRequests.length === 0 ? "You're all caught up." : `${friendRequests.length} waiting for your response`}</p>
              </div>
              <button type="button" onClick={() => setRequestsOpen(false)} aria-label="Close friend requests" className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xl text-ink-muted shadow-soft transition hover:bg-brand-50 hover:text-brand-700">×</button>
            </div>

            {requestError && <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{requestError}</p>}

            <div className="mt-5 max-h-[60vh] space-y-3 overflow-y-auto">
              {friendRequests.length === 0 && (
                <div className="rounded-2xl border border-brand-100 bg-white/65 px-5 py-10 text-center text-sm text-ink-muted">New requests will appear here.</div>
              )}
              {friendRequests.map((friendRequest) => (
                <article key={friendRequest.id} className="friend-request-card rounded-2xl border border-brand-100 bg-white/75 p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <StudentAvatar name={friendRequest.sender.name} avatarUrl={friendRequest.sender.avatarUrl} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-ink">{friendRequest.sender.name}</h3>
                      <p className="truncate text-xs text-ink-muted">{friendRequest.sender.major || friendRequest.sender.faculty} · Year {friendRequest.sender.yearOfStudy}{friendRequest.sender.mbti ? ` · ${friendRequest.sender.mbti}` : ""}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Link href={`/profile/${friendRequest.sender.id}`} className="mr-auto rounded-full px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-50">View profile</Link>
                    <button type="button" disabled={respondingId === friendRequest.id} onClick={() => void respondToRequest(friendRequest.id, "decline")} className="rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-semibold text-ink-muted transition hover:border-brand-300 hover:text-brand-700 disabled:opacity-50">Ignore</button>
                    <button type="button" disabled={respondingId === friendRequest.id} onClick={() => void respondToRequest(friendRequest.id, "accept")} className="rounded-full bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2 text-xs font-semibold text-white shadow-soft transition hover:from-brand-600 hover:to-brand-800 disabled:opacity-50">{respondingId === friendRequest.id ? "Updating…" : "Accept"}</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      )}
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
