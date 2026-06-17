import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || (session.user.role !== "TEACHER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { score } = await req.json();
    const answer = await prisma.answer.update({
      where: { id },
      data: {
        score,
        gradedBy: session.user.id,
        gradedAt: new Date(),
      },
    });
    return NextResponse.json(answer);
  } catch {
    return NextResponse.json({ error: "Failed to update answer" }, { status: 500 });
  }
}
