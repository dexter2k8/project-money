import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { IUser } from "./types";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await admin.auth().verifyIdToken(token);

    const user: IUser = {
      displayName: decodedToken?.name,
      email: decodedToken?.email,
      photoURL: decodedToken?.picture,
      uid: decodedToken?.uid,
      role: decodedToken?.role,
      exp: decodedToken?.exp,
    };

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Get user error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
