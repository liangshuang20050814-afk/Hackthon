// [Owner: A] Shared guard for hiding seed placeholders from user-facing lists.
// The demo student itself is updated by prisma/seed.ts; this keeps older local
// databases from surfacing stale placeholder rows as real classmates/matches.
import type { Prisma } from "@prisma/client";

export const NON_PLACEHOLDER_STUDENT_WHERE: Prisma.StudentWhereInput = {
  NOT: [
    { name: "Placeholder Student" },
    { bio: { contains: "Seed data placeholder" } },
  ],
};
