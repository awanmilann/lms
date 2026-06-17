import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: "ok",
      database: "connected",
      userCount,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasAuthSecret: !!process.env.AUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
