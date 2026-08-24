import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const id = req.nextUrl.pathname.split("/").pop() ?? "";

    const db = admin.firestore();
    const doc = await db.collection("contas").doc(id).get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await db.collection("contas").doc(id).delete();

    return NextResponse.json("Account deleted successfully", { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Delete account error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
