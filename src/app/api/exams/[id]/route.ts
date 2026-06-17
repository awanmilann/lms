import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      examQuestions: {
        orderBy: { orderIndex: "asc" },
        include: { question: true },
      },
      creator: { select: { name: true } },
    },
  });

  if (!exam) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(exam);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        duration: body.duration,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        status: body.status,
        token: body.token || null,
      },
    });
    return NextResponse.json(exam);
  } catch {
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.exam.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
