import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const attempt = await prisma.examAttempt.findUnique({
    where: { id },
    include: {
      exam: {
        include: {
          examQuestions: {
            orderBy: { orderIndex: "asc" },
            include: { question: { include: { category: { select: { name: true } } } } },
          },
        },
      },
      answers: {
        include: { question: true },
      },
    },
  });

  if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (attempt.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(attempt);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const attempt = await prisma.examAttempt.findUnique({ where: { id }, include: { exam: true } });
    if (!attempt) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.action === "submit") {
      const now = new Date();
      const mcQuestions = await prisma.question.findMany({
        where: { examQuestions: { some: { examId: attempt.examId } }, type: "MULTIPLE_CHOICE" },
      });

      const answers = await prisma.answer.findMany({ where: { attemptId: id } });
      let totalScore = 0;
      const answerUpdates = [];

      for (const answer of answers) {
        const question = mcQuestions.find((q) => q.id === answer.questionId);
        if (question && question.type === "MULTIPLE_CHOICE") {
          const isCorrect = answer.answer === question.correctAnswer;
          answerUpdates.push(
            prisma.answer.update({
              where: { id: answer.id },
              data: { isCorrect, score: isCorrect ? question.points : 0 },
            })
          );
          if (isCorrect) totalScore += question.points;
        }
      }

      await Promise.all(answerUpdates);

      const updated = await prisma.examAttempt.update({
        where: { id },
        data: {
          status: body.hasEssay ? "SUBMITTED" : "GRADED",
          endTime: now,
          totalScore,
        },
      });

      return NextResponse.json(updated);
    }

    if (body.action === "answer") {
      const existing = await prisma.answer.findUnique({
        where: { attemptId_questionId: { attemptId: id, questionId: body.questionId } },
      });

      if (existing) {
        const updated = await prisma.answer.update({
          where: { id: existing.id },
          data: { answer: body.answer },
        });
        return NextResponse.json(updated);
      }

      const answer = await prisma.answer.create({
        data: {
          attemptId: id,
          questionId: body.questionId,
          answer: body.answer,
        },
      });
      return NextResponse.json(answer);
    }

    if (body.action === "grade") {
      // Recalculate total from all graded answers
      const answers = await prisma.answer.findMany({ where: { attemptId: id } });
      const totalScore = answers.reduce((sum, a) => sum + (a.score ?? 0), 0);

      const updated = await prisma.examAttempt.update({
        where: { id },
        data: { status: "GRADED", totalScore },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update attempt" }, { status: 500 });
  }
}
