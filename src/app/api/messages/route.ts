// [Owner: C] GET/POST messages for a conversation. Polled by
// src/lib/polling/useChatPolling.ts every 2s from the client.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const messages = await db.message.findMany({
    where: { conversationId },
    orderBy: { sentAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { conversationId, senderId, text } = body as {
    conversationId?: string;
    senderId?: string;
    text?: string;
  };

  if (!conversationId || !senderId || !text) {
    return NextResponse.json(
      { error: "conversationId, senderId and text are required" },
      { status: 400 },
    );
  }

  const message = await db.message.create({
    data: { conversationId, senderId, body: text },
  });
  return NextResponse.json(message, { status: 201 });
}
