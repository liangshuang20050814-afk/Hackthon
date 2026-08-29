import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const courses = [
  { code: "COMP3888", name: "Computer Science Project", dayOfWeek: 0, startTime: "09:00", endTime: "10:00", location: "J12 Seminar Room" },
  { code: "COMP3308", name: "Introduction to Artificial Intelligence", dayOfWeek: 0, startTime: "11:00", endTime: "13:00", location: "Carslaw 273" },
  { code: "INFO1110", name: "Introduction to Programming", dayOfWeek: 1, startTime: "09:00", endTime: "11:00", location: "ABS Lecture Theatre" },
  { code: "ECON1001", name: "Introductory Microeconomics", dayOfWeek: 1, startTime: "14:00", endTime: "16:00", location: "Merewether 131" },
  { code: "MATH1005", name: "Statistical Thinking with Data", dayOfWeek: 2, startTime: "10:00", endTime: "12:00", location: "Carslaw 159" },
  { code: "COMP2017", name: "Systems Programming", dayOfWeek: 2, startTime: "14:00", endTime: "16:00", location: "J12 Lecture Theatre" },
  { code: "PSYC1001", name: "Psychology 1001", dayOfWeek: 3, startTime: "10:00", endTime: "12:00", location: "Brennan MacCallum 101" },
  { code: "INFO2222", name: "Computing 2 Usability and Security", dayOfWeek: 3, startTime: "14:00", endTime: "16:00", location: "PNR Learning Studio" },
  { code: "DATA1001", name: "Foundations of Data Science", dayOfWeek: 4, startTime: "10:00", endTime: "12:00", location: "Carslaw 173" },
  { code: "ELEC1601", name: "Introduction to Computer Systems", dayOfWeek: 4, startTime: "14:00", endTime: "16:00", location: "Electrical Engineering 351" },
] as const;

interface StudentFixture {
  id: string;
  name: string;
  faculty: string;
  major: string;
  yearOfStudy: number;
  bio: string;
  mbti: string;
  interests: string[];
  courses?: string[];
}

const students: StudentFixture[] = [
  { id: "demo-student-1", name: "Alex Chen", faculty: "Engineering", major: "Software Engineering", yearOfStudy: 2, bio: "Builder, casual climber, and always keen for a productive study session or campus event.", mbti: "INTJ", interests: ["Programming", "Climbing", "Coffee"], courses: ["COMP3888", "COMP3308", "COMP2017"] },
  { id: "demo-student-2", name: "Mia Chen", faculty: "Engineering", major: "Computer Science", yearOfStudy: 2, bio: "Loves systems programming, campus coffee spots, and finding study partners before labs.", mbti: "ENTP", interests: ["Programming", "Coffee", "Photography"], courses: ["COMP2017", "DATA1001", "COMP3888"] },
  { id: "demo-student-3", name: "Noah Patel", faculty: "Science", major: "Data Science", yearOfStudy: 1, bio: "Looking for friends to join sport events and debug first-year programming assignments.", mbti: "ENFP", interests: ["Football", "Gaming", "Machine Learning"], courses: ["INFO1110", "DATA1001", "PSYC1001"] },
  { id: "demo-student-4", name: "Sophie Nguyen", faculty: "Engineering", major: "Biomedical Engineering", yearOfStudy: 3, bio: "Morning runner, amateur photographer, and enthusiastic five-a-side football player.", mbti: "ESFJ", interests: ["Running", "Photography", "Football"] },
  { id: "demo-student-5", name: "Liam Wilson", faculty: "Arts and Social Sciences", major: "Economics", yearOfStudy: 2, bio: "Economics student who enjoys live music, good films, and meeting people from other faculties.", mbti: "ENTJ", interests: ["Music", "Movies", "Entrepreneurship"] },
  { id: "demo-student-6", name: "Aisha Rahman", faculty: "Science", major: "Psychology", yearOfStudy: 1, bio: "Psychology student, book lover, and volunteer tutor who never says no to board games.", mbti: "INFJ", interests: ["Reading", "Board Games", "Volunteering"] },
  { id: "demo-student-7", name: "Ethan Brown", faculty: "Business", major: "Finance", yearOfStudy: 3, bio: "Interested in startups, social events, and turning group assignments into something enjoyable.", mbti: "ESTP", interests: ["Entrepreneurship", "Party", "Basketball"] },
  { id: "demo-student-8", name: "Olivia Zhang", faculty: "Engineering", major: "Computer Science", yearOfStudy: 2, bio: "Frontend developer, design nerd, and regular at university gaming nights.", mbti: "ISFP", interests: ["Programming", "Gaming", "Design"] },
  { id: "demo-student-9", name: "Lucas Martin", faculty: "Science", major: "Mathematics", yearOfStudy: 2, bio: "Maths student who likes long runs, football, and explaining difficult concepts on whiteboards.", mbti: "ISTJ", interests: ["Running", "Football", "Reading"] },
  { id: "demo-student-10", name: "Isabella Rossi", faculty: "Architecture", major: "Design in Architecture", yearOfStudy: 3, bio: "Architecture student documenting Sydney through sketches, photos, and too much coffee.", mbti: "ENFJ", interests: ["Design", "Photography", "Coffee"] },
  { id: "demo-student-11", name: "Jack Thompson", faculty: "Engineering", major: "Mechatronic Engineering", yearOfStudy: 4, bio: "Robotics enthusiast who balances lab projects with basketball and multiplayer games.", mbti: "ISTP", interests: ["Robotics", "Basketball", "Gaming"] },
  { id: "demo-student-12", name: "Amelia Davis", faculty: "Medicine and Health", major: "Health Sciences", yearOfStudy: 2, bio: "Enjoys volunteering, social sport, and organising calm study groups before exams.", mbti: "ISFJ", interests: ["Volunteering", "Running", "Study Groups"] },
  { id: "demo-student-13", name: "Leo Kim", faculty: "Engineering", major: "Software Engineering", yearOfStudy: 3, bio: "Backend developer and coffee explorer, currently learning how to climb without overthinking it.", mbti: "INTP", interests: ["Programming", "Climbing", "Coffee"] },
  { id: "demo-student-14", name: "Grace Lee", faculty: "Arts and Social Sciences", major: "Media and Communications", yearOfStudy: 2, bio: "Campus photographer and film fan who enjoys meeting people through creative projects.", mbti: "ENFP", interests: ["Photography", "Movies", "Music"] },
  { id: "demo-student-15", name: "Henry Garcia", faculty: "Business", major: "Business Analytics", yearOfStudy: 1, bio: "Learning data analytics, building startup ideas, and always available for a board-game break.", mbti: "ENTP", interests: ["Machine Learning", "Entrepreneurship", "Board Games"] },
  { id: "demo-student-16", name: "Chloe Taylor", faculty: "Science", major: "Computer Science", yearOfStudy: 1, bio: "First-year programmer, cozy gamer, and fan of friendly study sessions at Fisher.", mbti: "INFP", interests: ["Programming", "Gaming", "Study Groups"] },
  { id: "demo-student-17", name: "Oscar Silva", faculty: "Engineering", major: "Electrical Engineering", yearOfStudy: 3, bio: "Electronics tinkerer who enjoys football, running, and teaching people how hardware works.", mbti: "ESTJ", interests: ["Robotics", "Football", "Running"] },
  { id: "demo-student-18", name: "Zoe Williams", faculty: "Arts and Social Sciences", major: "Psychology", yearOfStudy: 2, bio: "Interested in people, books, volunteering, and conversations over coffee.", mbti: "INFJ", interests: ["Reading", "Volunteering", "Coffee"] },
  { id: "demo-student-19", name: "William Wang", faculty: "Engineering", major: "Data Science", yearOfStudy: 4, bio: "Machine learning student, basketball fan, and dependable teammate for ambitious projects.", mbti: "INTJ", interests: ["Machine Learning", "Basketball", "Programming"] },
  { id: "demo-student-20", name: "Emily Johnson", faculty: "Business", major: "Marketing", yearOfStudy: 2, bio: "Marketing student who plans social events and collects playlists for every occasion.", mbti: "ESFP", interests: ["Party", "Music", "Social Events"] },
  { id: "demo-student-21", name: "Daniel Park", faculty: "Science", major: "Mathematics", yearOfStudy: 3, bio: "Enjoys statistics, strategy games, and focused study blocks with a small group.", mbti: "INTP", interests: ["Board Games", "Study Groups", "Reading"] },
  { id: "demo-student-22", name: "Harper Smith", faculty: "Architecture", major: "Interaction Design", yearOfStudy: 2, bio: "Interaction designer interested in inclusive products, photography, and live music.", mbti: "ENFJ", interests: ["Design", "Photography", "Music"] },
  { id: "demo-student-23", name: "Benjamin Clark", faculty: "Engineering", major: "Computer Science", yearOfStudy: 2, bio: "Competitive gamer, systems student, and surprisingly enthusiastic weekend cook.", mbti: "ISTP", interests: ["Gaming", "Programming", "Cooking"] },
  { id: "demo-student-24", name: "Lily Anderson", faculty: "Medicine and Health", major: "Exercise Physiology", yearOfStudy: 3, bio: "Runs before lectures, plays social basketball, and volunteers at community sport programs.", mbti: "ESFJ", interests: ["Running", "Basketball", "Volunteering"] },
  { id: "demo-student-25", name: "Samuel Jones", faculty: "Business", major: "Economics", yearOfStudy: 1, bio: "Curious about economics and startups, usually found discussing ideas over coffee.", mbti: "ENTJ", interests: ["Entrepreneurship", "Coffee", "Reading"] },
  { id: "demo-student-26", name: "Hannah Wu", faculty: "Science", major: "Psychology", yearOfStudy: 2, bio: "Psychology student who loves films, board games, and low-pressure social events.", mbti: "ISFP", interests: ["Movies", "Board Games", "Social Events"] },
  { id: "demo-student-27", name: "Max Müller", faculty: "Engineering", major: "Robotics and Mechatronics", yearOfStudy: 4, bio: "Builds robots, climbs walls, and joins any project involving sensors or computer vision.", mbti: "ENTP", interests: ["Robotics", "Climbing", "Machine Learning"] },
  { id: "demo-student-28", name: "Ruby Evans", faculty: "Arts and Social Sciences", major: "Digital Cultures", yearOfStudy: 3, bio: "Writes about digital culture, takes street photos, and hosts relaxed music nights.", mbti: "ENFP", interests: ["Photography", "Music", "Writing"] },
  { id: "demo-student-29", name: "Thomas Baker", faculty: "Engineering", major: "Software Engineering", yearOfStudy: 1, bio: "New to university, keen to meet coding friends and join casual football games.", mbti: "ISTJ", interests: ["Programming", "Football", "Gaming"] },
  { id: "demo-student-30", name: "Nora Hassan", faculty: "Science", major: "Data Science", yearOfStudy: 3, bio: "Data storyteller, volunteer mentor, and organiser of friendly exam-season study groups.", mbti: "ENFJ", interests: ["Machine Learning", "Volunteering", "Study Groups"] },
];

const seededEventIds = [
  "seed-event-football", "seed-event-study", "seed-event-party", "seed-event-games",
  "seed-event-run", "seed-event-photo", "seed-event-startup", "seed-event-movie",
];

function futureDate(daysAhead: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  const courseIds = new Map<string, string>();
  for (const course of courses) {
    const row = await prisma.course.upsert({
      where: { code: course.code },
      update: { name: course.name },
      create: { code: course.code, name: course.name },
    });
    courseIds.set(course.code, row.id);
  }

  const allInterestLabels = [...new Set(students.flatMap((student) => student.interests))];
  const interestIds = new Map<string, string>();
  for (const label of allInterestLabels) {
    const existing = await prisma.interest.findFirst({ where: { label } });
    const interest = existing ?? await prisma.interest.create({ data: { label } });
    interestIds.set(label, interest.id);
  }

  for (const student of students) {
    const interests = student.interests.map((label) => ({ id: interestIds.get(label)! }));
    const profile = {
      name: student.name,
      faculty: student.faculty,
      major: student.major,
      yearOfStudy: student.yearOfStudy,
      bio: student.bio,
      mbti: student.mbti,
      avatarUrl: null,
    };
    await prisma.student.upsert({
      where: { id: student.id },
      update: { ...profile, interests: { set: interests } },
      create: { id: student.id, ...profile, interests: { connect: interests } },
    });
  }

  const studentIds = students.map((student) => student.id);
  await prisma.enrollment.deleteMany({ where: { studentId: { in: studentIds } } });
  const enrollmentData = students.flatMap((student, index) => {
    const assignedCodes = student.courses ?? [
      courses[index % courses.length].code,
      courses[(index + 3) % courses.length].code,
      courses[(index + 6) % courses.length].code,
    ];
    return assignedCodes.map((code) => {
      const session = courses.find((course) => course.code === code)!;
      return {
        studentId: student.id,
        courseId: courseIds.get(code)!,
        dayOfWeek: session.dayOfWeek,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
      };
    });
  });
  await prisma.enrollment.createMany({ data: enrollmentData });

  const eventFixtures = [
    { id: "seed-event-football", title: "Sunset Football at The Square", description: "Friendly five-a-side football. All skill levels welcome; bring water and a light shirt.", location: "The Square", eventType: "Sports", startsAt: futureDate(1, 17), durationMinutes: 90, capacity: 12, creatorId: "demo-student-4", attendees: ["demo-student-4", "demo-student-1", "demo-student-2", "demo-student-9", "demo-student-17"] },
    { id: "seed-event-study", title: "COMP2017 Study Sprint", description: "Work through pointers and memory-management exercises together before the lab.", location: "Fisher Library Level 3", eventType: "Study", startsAt: futureDate(2, 15), durationMinutes: 120, capacity: 8, creatorId: "demo-student-2", attendees: ["demo-student-2", "demo-student-1", "demo-student-13", "demo-student-16", "demo-student-29"] },
    { id: "seed-event-party", title: "International Students House Party", description: "Music, snacks, and an easy way to meet students from across campus.", location: "Redfern Student Apartments", eventType: "Party", startsAt: futureDate(3, 19), durationMinutes: 240, capacity: 24, creatorId: "demo-student-7", attendees: ["demo-student-7", "demo-student-5", "demo-student-14", "demo-student-20", "demo-student-28"] },
    { id: "seed-event-games", title: "Board Games and Mario Kart", description: "A relaxed evening with party games, strategy games, and Mario Kart.", location: "Wentworth Common Room", eventType: "Gaming", startsAt: futureDate(4, 18), durationMinutes: 180, capacity: 16, creatorId: "demo-student-8", attendees: ["demo-student-8", "demo-student-1", "demo-student-6", "demo-student-15", "demo-student-21", "demo-student-23"] },
    { id: "seed-event-run", title: "Before-Class Campus Run", description: "Easy 5 km loop around Victoria Park and campus. Conversational pace.", location: "University Oval Entrance", eventType: "Sports", startsAt: futureDate(5, 7), durationMinutes: 60, capacity: 10, creatorId: "demo-student-24", attendees: ["demo-student-24", "demo-student-4", "demo-student-9", "demo-student-17"] },
    { id: "seed-event-photo", title: "Golden Hour Photo Walk", description: "Explore the Quad and nearby streets while sharing photography tips.", location: "The Quadrangle", eventType: "Social", startsAt: futureDate(6, 16, 30), durationMinutes: 90, capacity: 10, creatorId: "demo-student-10", attendees: ["demo-student-10", "demo-student-2", "demo-student-14", "demo-student-22", "demo-student-28"] },
    { id: "seed-event-startup", title: "Student Startup Idea Mixer", description: "Pitch a problem, find potential teammates, and exchange feedback over pizza.", location: "Sydney Knowledge Hub", eventType: "Social", startsAt: futureDate(7, 17, 30), durationMinutes: 120, capacity: 20, creatorId: "demo-student-15", attendees: ["demo-student-15", "demo-student-5", "demo-student-7", "demo-student-19", "demo-student-25"] },
    { id: "seed-event-movie", title: "Friday Movie Night", description: "A casual campus movie night followed by snacks and conversation.", location: "Hermann's Bar", eventType: "Other", startsAt: futureDate(8, 19), durationMinutes: 150, capacity: 18, creatorId: "demo-student-26", attendees: ["demo-student-26", "demo-student-5", "demo-student-14", "demo-student-18", "demo-student-20"] },
  ];

  for (const event of eventFixtures) {
    const { attendees: _attendees, ...data } = event;
    await prisma.event.upsert({ where: { id: event.id }, update: data, create: data });
  }
  await prisma.eventAttendee.deleteMany({ where: { eventId: { in: seededEventIds } } });
  await prisma.eventAttendee.createMany({
    data: eventFixtures.flatMap((event) => [...new Set(event.attendees)].map((studentId) => ({ eventId: event.id, studentId }))),
  });

  await prisma.friendRequest.upsert({
    where: { senderId_receiverId: { senderId: "demo-student-16", receiverId: "demo-student-1" } },
    update: { status: "PENDING" },
    create: { id: "demo-friend-request-chloe", senderId: "demo-student-16", receiverId: "demo-student-1" },
  });
  await prisma.friendRequest.upsert({
    where: { senderId_receiverId: { senderId: "demo-student-13", receiverId: "demo-student-1" } },
    update: { status: "PENDING" },
    create: { id: "demo-friend-request-leo", senderId: "demo-student-13", receiverId: "demo-student-1" },
  });

  const conversationWithMia = await prisma.conversation.upsert({
    where: { studentAId_studentBId: { studentAId: "demo-student-1", studentBId: "demo-student-2" } },
    update: {},
    create: { id: "demo-conversation-1", studentAId: "demo-student-1", studentBId: "demo-student-2" },
  });
  const conversationWithNoah = await prisma.conversation.upsert({
    where: { studentAId_studentBId: { studentAId: "demo-student-1", studentBId: "demo-student-3" } },
    update: {},
    create: { id: "demo-conversation-2", studentAId: "demo-student-1", studentBId: "demo-student-3" },
  });
  await prisma.message.deleteMany({ where: { conversationId: { in: [conversationWithMia.id, conversationWithNoah.id] } } });
  await prisma.message.createMany({
    data: [
      { conversationId: conversationWithMia.id, senderId: "demo-student-2", body: "Hey, we both have COMP2017 on Wednesday. Want to review pointers together?" },
      { conversationId: conversationWithMia.id, senderId: "demo-student-1", body: "Yes! I am free after the lab. Fisher Library?" },
      { conversationId: conversationWithNoah.id, senderId: "demo-student-3", body: "Are you going to the campus football meetup this week?" },
    ],
  });

  console.log(`Seeded ${students.length} students, ${courses.length} courses, ${enrollmentData.length} enrollments, and ${eventFixtures.length} events.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
