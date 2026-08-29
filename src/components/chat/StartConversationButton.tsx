"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { getCurrentStudentId } from "@/lib/demo-user";

const CURRENT_STUDENT_ID = getCurrentStudentId();

export function StartConversationButton({ studentId }: { studentId: string }) {
  const router = useRouter();
  const [isOpening, setIsOpening] = useState(false);

  async function openConversation() {
    setIsOpening(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentAId: CURRENT_STUDENT_ID,
        studentBId: studentId,
      }),
    });
    setIsOpening(false);

    if (!res.ok) return;

    const conversation: { id: string } = await res.json();
    router.push(`/chat/${conversation.id}`);
  }

  if (studentId === CURRENT_STUDENT_ID) return null;

  return (
    <Button type="button" onClick={openConversation} disabled={isOpening}>
      {isOpening ? "Opening..." : "Message"}
    </Button>
  );
}
