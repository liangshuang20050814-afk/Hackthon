// [Owner: A] HIGHEST PRIORITY — must ship within the first 4 hours.
// B and C both build their UI against this data, so an empty/thin seed
// blocks the whole team.
//
// Requirements for the real implementation:
// 1. Generate 30 fake students (name, avatar, bio, faculty, year, interests).
// 2. Use REAL University of Sydney course codes (e.g. COMP2017, DATA1001,
//    INFO1110, MATH1005, ECON1001, ...) so the demo looks credible.
// 3. Deliberately overlap timetables: pick a handful of courses and assign
//    5-10 students to each, so the "classmates" and "matching" features have
//    something interesting to show. Also deliberately give some pairs of
//    students the exact same free time slot on the same day, for the
//    "shared_free_time" match reason.
// 4. Seed a handful of Events (no creation UI, so this is the only source).
// 5. Optionally pre-compute a few Match rows for the demo's "hero" student
//    so /matches has good-looking data even before scoring.ts is finished.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // TODO [A]: replace with the real 30-student generator described above.
  const demoCourse = await prisma.course.upsert({
    where: { code: "COMP2017" },
    update: {},
    create: { code: "COMP2017", name: "Systems Programming" },
  });

  const demoStudent = await prisma.student.upsert({
    where: { id: "demo-student-1" },
    update: {},
    create: {
      id: "demo-student-1",
      name: "Placeholder Student",
      faculty: "Engineering",
      yearOfStudy: 2,
      bio: "Seed data placeholder — replace with generated profile.",
      enrollments: {
        create: {
          courseId: demoCourse.id,
          dayOfWeek: 2, // Wednesday
          startTime: "14:00",
          endTime: "16:00",
          location: "Seed Building 101",
        },
      },
    },
  });

  console.log(`Seeded placeholder student: ${demoStudent.name}`);
  console.log("TODO [A]: expand this to 30 students + events + interests.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
