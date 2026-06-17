import { cookies } from "next/headers";
import { verifyToken } from "./jwt";

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export async function auth(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session-token")?.value;
    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    return {
      user: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
    };
  } catch {
    return null;
  }
}
