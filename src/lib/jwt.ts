import jwt from "jsonwebtoken";

const SECRET = process.env.AUTH_SECRET || "fallback-secret";

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}
