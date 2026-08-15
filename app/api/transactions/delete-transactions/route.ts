import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const body = await request.json();
    const { acctid, month, year } = body as {
      acctid: string;
      month: number;
      year: number;
    };

    if (!acctid || month == null || !year) {
      return NextResponse.json({ error: "acctid, month, and year are required" }, { status: 400 });
    }

    const db = admin.firestore();
    const snapshot = await db.collection("contas").where("acctid", "==", acctid).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountDoc = snapshot.docs[0];
    const extratosRef = accountDoc.ref.collection("extratos");
    const saldosRef = accountDoc.ref.collection("saldos");

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    const startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
    const endTimestamp = admin.firestore.Timestamp.fromDate(endDate);

    const extratosSnapshot = await extratosRef
      .where("dtposted", ">=", startTimestamp)
      .where("dtposted", "<=", endTimestamp)
      .get();

    const batch = db.batch();

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
    console.error("Delete transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transactions" }, { status: 500 });
  }
}
