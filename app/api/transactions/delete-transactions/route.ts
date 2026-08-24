import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, month, year } = body as {
      accountId: string;
      month: number;
      year: number;
    };

    if (!accountId || month == null || !year) {
      return NextResponse.json({ error: "accountId, month, and year are required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountDoc = await db.collection("contas").doc(accountId).get();

    if (!accountDoc.exists || accountDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const extratosRef = accountDoc.ref.collection("extratos");
    const saldosRef = accountDoc.ref.collection("saldos");

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

    const extratosSnapshot = await extratosRef
      .where("dtposted", ">=", startTimestamp)
      .where("dtposted", "<=", endTimestamp)
      .get();

    const batch = admin.firestore().batch();

    for (const doc of extratosSnapshot.docs) {
      batch.delete(doc.ref);
    }

    const saldosSnapshot = await saldosRef
      .where("enddate", ">=", startTimestamp)
      .where("enddate", "<=", endTimestamp)
      .get();

    for (const doc of saldosSnapshot.docs) {
      batch.delete(doc.ref);
    }

    await batch.commit();

    return NextResponse.json(
      { success: true, deleted: extratosSnapshot.size },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Delete transactions error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
