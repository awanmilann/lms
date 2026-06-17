import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { examId } = await req.json();

    const existing = await prisma.examAttempt.findUnique({
      where: { examId_userId: { examId, userId: session.user.id } },
    });
    if (existing) return NextResponse.json(existing);

    const attempt = await prisma.examAttempt.create({
      data: {
        examId,
        userId: session.user.id,
      },
    });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          orderBy: { orderIndex: "asc" },
          include: { question: true },
        },
      },
    });

    return NextResponse.json({ attempt, exam });
  } catch {
    return NextResponse.json({ error: "Failed to start attempt" }, { status: 500 });
  }
}
