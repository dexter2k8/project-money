import { auth } from "@/app/services/firebase";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await auth.signOut();
    const cookieStore = await cookies();
    cookieStore.delete("project-money-token");
    return NextResponse.json({ message: "Sign out successfully" }, { status: 200 });
  } catch (error) {
    console.error("Sign-out error:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
