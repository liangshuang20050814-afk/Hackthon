import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentStudentId } from "@/lib/demo-user";

const PENDING = "PENDING";
const ACCEPTED = "ACCEPTED";
const DECLINED = "DECLINED";

export async function GET() {
  const receiverId = getCurrentStudentId();
  const requests = await db.friendRequest.findMany({
    where: { receiverId, status: PENDING },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          faculty: true,
          major: true,
          yearOfStudy: true,
          mbti: true,
        },
      },
    },
  });

  return NextResponse.json(requests);
}

export async function POST(request: Request) {
  let body: { action?: string; receiverId?: string; requestId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const currentStudentId = getCurrentStudentId();

  if (body.action === "create") {
    if (!body.receiverId || body.receiverId === currentStudentId) {
      return NextResponse.json({ error: "Choose another student." }, { status: 400 });
    }

    const receiver = await db.student.findUnique({ where: { id: body.receiverId }, select: { id: true } });
    if (!receiver) return NextResponse.json({ error: "Student not found." }, { status: 404 });

    const reverseRequest = await db.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId: body.receiverId, receiverId: currentStudentId } },
    });
    if (reverseRequest?.status === PENDING) {
      return NextResponse.json({ error: "This student has already sent you a request. Open Chat to respond." }, { status: 409 });
    }

    const existing = await db.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId: currentStudentId, receiverId: body.receiverId } },
    });
    if (existing?.status === ACCEPTED) return NextResponse.json(existing);

    const friendRequest = existing
      ? await db.friendRequest.update({ where: { id: existing.id }, data: { status: PENDING } })
      : await db.friendRequest.create({ data: { senderId: currentStudentId, receiverId: body.receiverId } });
    return NextResponse.json(friendRequest, { status: existing ? 200 : 201 });
  }

  if ((body.action === "accept" || body.action === "decline") && body.requestId) {
    const friendRequest = await db.friendRequest.findFirst({
      where: { id: body.requestId, receiverId: currentStudentId, status: PENDING },
    });
    if (!friendRequest) return NextResponse.json({ error: "Pending request not found." }, { status: 404 });

    if (body.action === "decline") {
      const declined = await db.friendRequest.update({ where: { id: friendRequest.id }, data: { status: DECLINED } });
      return NextResponse.json(declined);
    }

    const [studentAId, studentBId] = [friendRequest.senderId, friendRequest.receiverId].sort();
    const result = await db.$transaction(async (transaction) => {
      const accepted = await transaction.friendRequest.update({
        where: { id: friendRequest.id },
        data: { status: ACCEPTED },
      });
      const existingConversation = await transaction.conversation.findFirst({
        where: {
          OR: [
            { studentAId: friendRequest.senderId, studentBId: friendRequest.receiverId },
            { studentAId: friendRequest.receiverId, studentBId: friendRequest.senderId },
          ],
        },
      });
      const conversation = existingConversation ?? await transaction.conversation.create({ data: { studentAId, studentBId } });
      return { accepted, conversation };
    });

    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Choose a valid friend-request action." }, { status: 400 });
}
