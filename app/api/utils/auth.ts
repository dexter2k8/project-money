import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export class AuthError extends Error {
  response: NextResponse;
  constructor(message: string, response: NextResponse) {
    super(message);
    this.name = "AuthError";
    this.response = response;
  }
}

export async function requireAuth(): Promise<string> {
  const cookieStore = await cookies();
  const token = cookieStore.get("project-money-token")?.value;

  if (!token) {
    throw new AuthError(
      "Not authenticated",
      NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    );
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch {
    throw new AuthError(
      "Invalid or expired token",
      NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    );
  }
}
