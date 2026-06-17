import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const where = session.user.role === "TEACHER"
    ? { createdBy: session.user.id }
    : {};

  const exams = await prisma.exam.findMany({
    where,
    include: {
      creator: { select: { name: true } },
      _count: { select: { examQuestions: true, examAttempts: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(exams);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const exam = await prisma.exam.create({
      data: {
        title: body.title,
        description: body.description,
        duration: body.duration,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        token: body.token || null,
        createdBy: session.user.id,
        examQuestions: {
          create: body.questionIds.map((qId: string, i: number) => ({
            questionId: qId,
            orderIndex: i,
          })),
        },
      },
      include: {
        examQuestions: { include: { question: true } },
      },
    });
    return NextResponse.json(exam);
  } catch {
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}
