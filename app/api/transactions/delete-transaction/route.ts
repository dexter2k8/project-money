import { NextResponse } from "next/server";
import { findAccountByAcctid } from "@/app/api/utils/account";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { acctid, transactionId } = body as {
      acctid: string;
      transactionId: string;
    };

    if (!acctid || !transactionId) {
      return NextResponse.json(
        { error: "acctid and transactionId are required" },
        { status: 400 },
      );
    }

    const accountDoc = await findAccountByAcctid(acctid);
    if (!accountDoc) {
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
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
