import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, transactionId } = body as {
      accountId: string;
      transactionId: string;
    };

    if (!accountId || !transactionId) {
      return NextResponse.json(
        { error: "accountId and transactionId are required" },
        { status: 400 },
      );
    }

    const db = admin.firestore();
    const accountDoc = await db.collection("contas").doc(accountId).get();

    if (!accountDoc.exists || accountDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const docRef = accountDoc.ref.collection("extratos").doc(transactionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Delete transaction error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
