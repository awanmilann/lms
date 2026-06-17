import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(question);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const question = await prisma.question.update({
      where: { id },
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
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
