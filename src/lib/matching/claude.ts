// [Owner: A] Wraps the Claude API to turn a scored MatchReason[] into a
// short, human-readable sentence for the match card. This is a thin
// presentation layer on top of scoring.ts — the score/reasons themselves
// must already be correct before this is called.
import Anthropic from "@anthropic-ai/sdk";
import type { MatchReason } from "@/lib/types";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function summarizeMatch(
  studentAName: string,
  studentBName: string,
  reasons: MatchReason[],
): Promise<string> {
  // TODO [A]: fall back to a template string (no API call) if
  // ANTHROPIC_API_KEY is unset, so the app still demos offline.
  const reasonLines = reasons
    .map((r) => {
      if (r.type === "shared_course") return `- both take ${r.courseCode} (${r.courseName})`;
      if (r.type === "shared_interest") return `- both are into ${r.interest}`;
      return `- both free ${r.day} ${r.window}`;
    })
    .join("\n");

  const message = await anthropic.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 100,
    messages: [
      {
        role: "user",
        content: `Write ONE short, friendly sentence (max 25 words) explaining why ${studentAName} and ${studentBName} were matched, based on:\n${reasonLines}\nDo not invent facts not listed above.`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text.trim() : "";
}
