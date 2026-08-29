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
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { sentAt: "asc" },
  });
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { conversationId, senderId, text, attachmentUrl, attachmentName, attachmentType, sticker } =
    body as {
    conversationId?: string;
    senderId?: string;
    text?: string;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentType?: string;
    sticker?: string;
  };
  const bodyText = text?.trim();
  const stickerText = sticker?.trim();

  if (!conversationId || !senderId || (!bodyText && !attachmentUrl && !stickerText)) {
    return NextResponse.json(
      { error: "conversationId, senderId and message content are required" },
      { status: 400 },
    );
  }

  const conversation = await db.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ studentAId: senderId }, { studentBId: senderId }],
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "conversation not found for sender" },
      { status: 404 },
    );
  }

  const message = await db.message.create({
    data: {
      conversationId,
      senderId,
      body: bodyText ?? "",
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      attachmentType: attachmentType || null,
      sticker: stickerText || null,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });
  return NextResponse.json(message, { status: 201 });
}
