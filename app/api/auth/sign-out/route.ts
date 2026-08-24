import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/firebase-error";
import { auth } from "@/app/services/firebase";

export async function POST() {
  try {
    await auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete("project-money-token");
    return NextResponse.json({ message: "Sign out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Sign-out error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
