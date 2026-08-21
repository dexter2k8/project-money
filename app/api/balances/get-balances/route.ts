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
    const flatten = request.nextUrl.searchParams.get("flatten") === "true";

    let snapshot: FirebaseFirestore.QuerySnapshot;

    if (acctid) {
      snapshot = await db.collection("contas").where("acctid", "==", acctid).get();
    } else {
      snapshot = await db.collection("contas").get();
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

      for (const doc of snapshot.docs) {
        const accountData = doc.data();
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
      snapshot.docs.map(async (doc) => {
        if (acctid) {
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
        }
        return {
          id: doc.id,
          ...doc.data(),
          saldos: [],
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
