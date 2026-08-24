import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    return NextResponse.json({ exp: decoded.exp }, { status: 200 });
  } catch (error) {
    console.error("Refresh token error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
