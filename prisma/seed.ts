import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("password123", 10);

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@lms.test" },
    update: {},
    create: {
      name: "Budi Guru",
      email: "teacher@lms.test",
      password,
      role: "TEACHER",
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@lms.test" },
    update: {},
    create: {
      name: "Ani Siswa",
      email: "student@lms.test",
      password,
      role: "STUDENT",
    },
  });

  const category = await prisma.category.upsert({
    where: { id: "cat-matematika" },
    update: {},
    create: {
      id: "cat-matematika",
      name: "Matematika",
      description: "Soal-soal matematika",
    },
  });

  const q1 = await prisma.question.create({
    data: {
      type: "MULTIPLE_CHOICE",
      text: "Berapakah hasil dari 2 + 2?",
      options: JSON.stringify(["2", "3", "4", "5"]),
      correctAnswer: "4",
      points: 5,
      categoryId: category.id,
    },
  });

  const q2 = await prisma.question.create({
    data: {
      type: "MULTIPLE_CHOICE",
      text: "Apa ibu kota Indonesia?",
      options: JSON.stringify(["Jakarta", "Bandung", "Surabaya", "Medan"]),
      correctAnswer: "Jakarta",
      points: 5,
      categoryId: category.id,
    },
  });

  const q3 = await prisma.question.create({
    data: {
      type: "MULTIPLE_CHOICE",
      text: "Berapakah akar kuadrat dari 144?",
      options: JSON.stringify(["10", "11", "12", "13"]),
      correctAnswer: "12",
      points: 5,
      categoryId: category.id,
    },
  });

  const q4 = await prisma.question.create({
    data: {
      type: "ESSAY",
      text: "Jelaskan mengapa air penting bagi kehidupan!",
      points: 10,
      categoryId: category.id,
    },
  });

  const exam = await prisma.exam.upsert({
    where: { id: "exam-matematika" },
    update: {},
    create: {
      id: "exam-matematika",
      title: "Ujian Matematika Dasar",
      description: "Ujian untuk menguji pemahaman dasar matematika",
      duration: 30,
      startTime: new Date(),
      endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "PUBLISHED",
      createdBy: teacher.id,
    },
  });

  const questions = [q1, q2, q3, q4];
  for (let i = 0; i < questions.length; i++) {
    await prisma.examQuestion.upsert({
      where: { examId_questionId: { examId: exam.id, questionId: questions[i].id } },
      update: {},
      create: { examId: exam.id, questionId: questions[i].id, orderIndex: i },
    });
  }

  console.log("Seed data created successfully!");
  console.log("Teacher: teacher@lms.test / password123");
  console.log("Student: student@lms.test / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
