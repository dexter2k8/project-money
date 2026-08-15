import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
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
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const body = await request.json();
    const { acctid, transactionId, data } = body as {
      acctid: string;
      transactionId: string;
      data: TTransactionUpdate;
    };

    if (!acctid || !transactionId) {
      return NextResponse.json({ error: "acctid and transactionId are required" }, { status: 400 });
    }

    if (!data || Object.keys(data).length === 0) {
      return NextResponse.json({ error: "data is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const snapshot = await db.collection("contas").where("acctid", "==", acctid).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountDoc = snapshot.docs[0];
    const extratosRef = accountDoc.ref.collection("extratos");
    const docRef = extratosRef.doc(transactionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.dtposted !== undefined) {
      updateData.dtposted = admin.firestore.Timestamp.fromDate(new Date(data.dtposted));
    }
    if (data.trnamt !== undefined) updateData.trnamt = data.trnamt;
    if (data.memo !== undefined) updateData.memo = data.memo;
    if (data.chknum !== undefined) updateData.chknum = data.chknum;
    if (data.trntype !== undefined) updateData.trntype = data.trntype;

    await docRef.update(updateData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Patch transaction error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}
