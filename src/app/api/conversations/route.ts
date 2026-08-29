// [Owner: C] Conversation list + "open chat" endpoint.
// POST is used after a match/friend action to create or reuse a dedicated
// one-to-one chat between two students.
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function normalizePair(studentAId: string, studentBId: string) {
  return [studentAId, studentBId].sort() as [string, string];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const studentId = searchParams.get("studentId");
  const conversationId = searchParams.get("conversationId");

  if (!studentId) {
    return NextResponse.json({ error: "studentId is required" }, { status: 400 });
  }

  const conversations = await db.conversation.findMany({
    where: {
      OR: [{ studentAId: studentId }, { studentBId: studentId }],
      ...(conversationId ? { id: conversationId } : {}),
    },
    include: {
      studentA: true,
      studentB: true,
      messages: {
        orderBy: { sentAt: "desc" },
        take: 1,
      },
    },
  });

  const formatted = conversations
    .map((conversation) => {
      const otherStudent =
        conversation.studentAId === studentId ? conversation.studentB : conversation.studentA;
      const lastMessage = conversation.messages[0] ?? null;

      return {
        id: conversation.id,
        otherStudent: {
          id: otherStudent.id,
          name: otherStudent.name,
          avatarUrl: otherStudent.avatarUrl,
          faculty: otherStudent.faculty,
          yearOfStudy: otherStudent.yearOfStudy,
        },
        lastMessage,
        updatedAt: lastMessage?.sentAt ?? conversation.createdAt,
      };
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return NextResponse.json(formatted);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { studentAId, studentBId } = body as {
    studentAId?: string;
    studentBId?: string;
  };

  if (!studentAId || !studentBId) {
    return NextResponse.json(
      { error: "studentAId and studentBId are required" },
      { status: 400 },
    );
  }

  if (studentAId === studentBId) {
    return NextResponse.json(
      { error: "Cannot create a conversation with yourself" },
      { status: 400 },
    );
  }

  const existing = await db.conversation.findFirst({
    where: {
      OR: [
        { studentAId, studentBId },
        { studentAId: studentBId, studentBId: studentAId },
      ],
    },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const [normalizedAId, normalizedBId] = normalizePair(studentAId, studentBId);
  const conversation = await db.conversation.create({
    data: {
      studentAId: normalizedAId,
      studentBId: normalizedBId,
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
