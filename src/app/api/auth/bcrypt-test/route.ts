import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const hash = await bcrypt.hash("test123", 10);
    const match = await bcrypt.compare("test123", hash);
    return NextResponse.json({ hash, match, ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: String(err), message: err?.message }, { status: 500 });
  }
}
