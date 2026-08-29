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
  const dataCourse = await prisma.course.upsert({
    where: { code: "DATA1001" },
    update: {},
    create: { code: "DATA1001", name: "Foundations of Data Science" },
  });
  const infoCourse = await prisma.course.upsert({
    where: { code: "INFO1110" },
    update: {},
    create: { code: "INFO1110", name: "Introduction to Programming" },
  });

  const demoStudent = await prisma.student.upsert({
    where: { id: "demo-student-1" },
    update: {
      name: "Alex Chen",
      faculty: "Engineering",
      yearOfStudy: 2,
      bio: "Second-year software engineering student looking for reliable study partners and campus events.",
    },
    create: {
      id: "demo-student-1",
      name: "Alex Chen",
      faculty: "Engineering",
      yearOfStudy: 2,
      bio: "Second-year software engineering student looking for reliable study partners and campus events.",
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

  await prisma.student.upsert({
    where: { id: "demo-student-2" },
    update: {
      name: "Mia Chen",
      faculty: "Engineering",
      yearOfStudy: 2,
      bio: "Loves systems programming, campus coffee spots, and finding study partners before labs.",
    },
    create: {
      id: "demo-student-2",
      name: "Mia Chen",
      faculty: "Engineering",
      yearOfStudy: 2,
      bio: "Loves systems programming, campus coffee spots, and finding study partners before labs.",
      enrollments: {
        create: [
          {
            courseId: demoCourse.id,
            dayOfWeek: 2,
            startTime: "14:00",
            endTime: "16:00",
            location: "Seed Building 101",
          },
          {
            courseId: dataCourse.id,
            dayOfWeek: 4,
            startTime: "10:00",
            endTime: "12:00",
            location: "Carslaw 173",
          },
        ],
      },
    },
  });

  await prisma.student.upsert({
    where: { id: "demo-student-3" },
    update: {
      name: "Noah Patel",
      faculty: "Science",
      yearOfStudy: 1,
      bio: "Looking for friends to join sport events and debug first-year programming assignments.",
    },
    create: {
      id: "demo-student-3",
      name: "Noah Patel",
      faculty: "Science",
      yearOfStudy: 1,
      bio: "Looking for friends to join sport events and debug first-year programming assignments.",
      enrollments: {
        create: [
          {
            courseId: infoCourse.id,
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "11:00",
            location: "ABS Lecture Theatre",
          },
          {
            courseId: dataCourse.id,
            dayOfWeek: 4,
            startTime: "10:00",
            endTime: "12:00",
            location: "Carslaw 173",
          },
        ],
      },
    },
  });

  const conversationWithMia = await prisma.conversation.upsert({
    where: {
      studentAId_studentBId: {
        studentAId: "demo-student-1",
        studentBId: "demo-student-2",
      },
    },
    update: {},
    create: {
      id: "demo-conversation-1",
      studentAId: "demo-student-1",
      studentBId: "demo-student-2",
    },
  });

  const conversationWithNoah = await prisma.conversation.upsert({
    where: {
      studentAId_studentBId: {
        studentAId: "demo-student-1",
        studentBId: "demo-student-3",
      },
    },
    update: {},
    create: {
      id: "demo-conversation-2",
      studentAId: "demo-student-1",
      studentBId: "demo-student-3",
    },
  });

  await prisma.message.deleteMany({
    where: { conversationId: { in: [conversationWithMia.id, conversationWithNoah.id] } },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversationWithMia.id,
        senderId: "demo-student-2",
        body: "Hey, we both have COMP2017 on Wednesday. Want to review pointers together?",
      },
      {
        conversationId: conversationWithMia.id,
        senderId: "demo-student-1",
        body: "Yes! I am free after the lab. Fisher Library?",
      },
      {
        conversationId: conversationWithNoah.id,
        senderId: "demo-student-3",
        body: "Are you going to the campus sport meetup this week?",
      },
    ],
  });

  console.log(`Seeded demo student: ${demoStudent.name}`);
  console.log("Seeded demo chat conversations for C.");
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
