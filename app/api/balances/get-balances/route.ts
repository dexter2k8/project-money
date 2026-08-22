import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { firestoreDateToString } from "@/app/utils/dates";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const db = admin.firestore();
    const acctid = request.nextUrl.searchParams.get("acctid");
    const accountId = request.nextUrl.searchParams.get("accountId");
    const flatten = request.nextUrl.searchParams.get("flatten") === "true";

    let accountDocs: FirebaseFirestore.DocumentSnapshot[] = [];

    if (accountId) {
      const doc = await db.collection("contas").doc(accountId).get();
      if (doc.exists) accountDocs = [doc];
    } else if (acctid) {
      const snapshot = await db.collection("contas").where("acctid", "==", acctid).get();
      accountDocs = snapshot.docs;
    } else {
      const snapshot = await db.collection("contas").get();
      accountDocs = snapshot.docs;
    }

    if (flatten) {
      const allBalances: {
        id: string;
        acctid: string;
        description: string;
        balance: number;
        enddate: string;
        accountId: string;
      }[] = [];

      for (const doc of accountDocs) {
        const accountData = doc.data();
        if (!accountData) continue;
        const saldosSnapshot = await doc.ref.collection("saldos").orderBy("enddate").get();
        for (const saldoDoc of saldosSnapshot.docs) {
          const saldoData = saldoDoc.data();
          allBalances.push({
            id: saldoDoc.id,
            acctid: accountData.acctid,
            description: accountData.description ?? "",
            balance: saldoData.balance ?? 0,
            enddate: firestoreDateToString(saldoData.enddate),
            accountId: doc.id,
          });
        }
      }

      return NextResponse.json({ data: allBalances, count: allBalances.length }, { status: 200 });
    }

    const data = await Promise.all(
      accountDocs.map(async (doc) => {
        const saldosSnapshot = await doc.ref.collection("saldos").orderBy("enddate").get();
        const saldos = saldosSnapshot.docs.map((s) => ({
          id: s.id,
          ...s.data(),
          enddate: firestoreDateToString(s.data().enddate),
        }));
        return {
          id: doc.id,
          ...doc.data(),
          saldos,
        };
      }),
    );

    const count = data[0]?.saldos.length ?? 0;

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Get balances error:", error);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
}
