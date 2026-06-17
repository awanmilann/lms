import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const { PrismaNeon } = await import("@prisma/adapter-neon");

    const cs = process.env.DATABASE_URL;
    const adapter = new PrismaNeon({ connectionString: cs });
    const prisma = new PrismaClient({ adapter });

    const userCount = await prisma.user.count();
    await prisma.$disconnect();

    return NextResponse.json({
      status: "ok",
      userCount,
      dbUrlPrefix: cs ? cs.slice(0, 20) + "..." : "MISSING",
      hasAuthSecret: !!process.env.AUTH_SECRET,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        name: error instanceof Error ? error.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack?.split("\n").slice(0, 3).join("\n") : undefined,
      },
      { status: 200 }
    );
  }
}
