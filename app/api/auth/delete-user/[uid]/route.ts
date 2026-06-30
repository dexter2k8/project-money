import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const uid = req.nextUrl.pathname.split("/").pop() ?? "";

    await admin.auth().deleteUser(uid);

    return NextResponse.json("Fund created successfully", { status: 200 });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
