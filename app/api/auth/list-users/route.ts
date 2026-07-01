import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { IUser } from "../get-self-user/types";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("project-money-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const listUsers = await admin.auth().listUsers();

    if (!listUsers) {
      return NextResponse.json({ message: "Not users found" }, { status: 401 });
    }

    const users: IUser[] = listUsers.users.map((user) => ({
      uid: user.uid,
      email: user.email as string,
      displayName: user.displayName as string,
      photoURL: user.photoURL as string,
    }));

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error("List users error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
// This line indicates that this function should be executed in Node.js environment.
// It's necessary to use the "edge" runtime, necessary to firebase-admin don't crash on vercel
export const runtime = "nodejs";
