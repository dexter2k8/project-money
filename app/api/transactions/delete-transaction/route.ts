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

    const db = admin.firestore();
    const snapshot = await db.collection("contas").where("acctid", "==", acctid).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountDoc = snapshot.docs[0];
    const docRef = accountDoc.ref.collection("extratos").doc(transactionId);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await docRef.delete();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}
