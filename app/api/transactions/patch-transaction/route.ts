import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import { parseDateLocal } from "@/app/utils/dates";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type TTransactionUpdate = {
  dtposted?: string;
  trnamt?: number;
  memo?: string;
  chknum?: string;
  trntype?: string;
};

export async function PATCH(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, transactionId, data } = body as {
      accountId: string;
      transactionId: string;
      data: TTransactionUpdate;
    };

    if (!accountId || !transactionId) {
      return NextResponse.json({ error: "accountId and transactionId are required" }, { status: 400 });
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountDoc = await db.collection("contas").doc(accountId).get();

    if (!accountDoc.exists || accountDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const extratosRef = accountDoc.ref.collection("extratos");
    const docRef = extratosRef.doc(transactionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.dtposted !== undefined) {
      updateData.dtposted = admin.firestore.Timestamp.fromDate(parseDateLocal(data.dtposted));
    }
    if (data.trnamt !== undefined) updateData.trnamt = data.trnamt;
    if (data.memo !== undefined) updateData.memo = data.memo;
    if (data.chknum !== undefined) updateData.chknum = data.chknum;
    if (data.trntype !== undefined) updateData.trntype = data.trntype;

    await docRef.update(updateData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Patch transaction error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
