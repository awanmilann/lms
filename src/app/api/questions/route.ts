import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const questions = await prisma.question.findMany({
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const question = await prisma.question.create({
      data: {
        type: body.type,
        text: body.text,
        options: body.options ? JSON.stringify(body.options) : null,
        correctAnswer: body.correctAnswer,
        points: body.points || 1,
        categoryId: body.categoryId,
        image: body.image || null,
      },
    });
    return NextResponse.json(question);
  } catch {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 });
  }
}
