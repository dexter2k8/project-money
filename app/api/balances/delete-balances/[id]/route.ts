import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await requireAuth();

    const { id } = await params;
    const accountId = req.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountDoc = await db.collection("contas").doc(accountId).get();

    if (!accountDoc.exists || accountDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountRef = db.collection("contas").doc(accountId);
    const saldoRef = accountRef.collection("saldos").doc(id);

    await saldoRef.delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Delete balance error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
