import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import { firestoreDateToString } from "@/app/utils/dates";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type TSaldoRange = {
  start: admin.firestore.Timestamp | null;
  end: admin.firestore.Timestamp | null;
};

/**
 * Resolves the `enddate` range used to filter saldos.
 * - `month` + `year`: from the previous month up to the selected month
 *   (the previous month balance is needed as the starting balance).
 * - `year`: from the previous year up to the selected year.
 * - `years`: fallback, calculated from the latest saldo of the account.
 */
async function resolveSaldoRange(
  saldosRef: FirebaseFirestore.CollectionReference,
  years: string | null,
  year: string | null,
  month: string | null,
): Promise<TSaldoRange> {
  let start: admin.firestore.Timestamp | null = null;
  let end: admin.firestore.Timestamp | null = null;

  if (years) {
    const latestSnapshot = await saldosRef.orderBy("enddate", "desc").limit(1).get();
    const latestDoc = latestSnapshot.docs[0];
    if (latestDoc) {
      const latestDate = latestDoc.data().enddate.toDate();
      const filterDate = new Date(latestDate);
      filterDate.setUTCFullYear(filterDate.getUTCFullYear() - Number(years));
      filterDate.setUTCMonth(filterDate.getUTCMonth() - 1);
      start = admin.firestore.Timestamp.fromDate(filterDate);
    }
  }

  if (year && month) {
    start = admin.firestore.Timestamp.fromDate(new Date(Date.UTC(Number(year), Number(month) - 2, 1)));
    end = admin.firestore.Timestamp.fromDate(new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59, 999)));
  } else if (year) {
    start = admin.firestore.Timestamp.fromDate(new Date(Date.UTC(Number(year) - 1, 0, 1)));
    end = admin.firestore.Timestamp.fromDate(new Date(Date.UTC(Number(year), 11, 31, 23, 59, 59, 999)));
  }

  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const db = admin.firestore();
    const acctid = request.nextUrl.searchParams.get("acctid");
    const accountId = request.nextUrl.searchParams.get("accountId");
    const flatten = request.nextUrl.searchParams.get("flatten") === "true";
    const fields = request.nextUrl.searchParams.get("fields");
    const years = request.nextUrl.searchParams.get("years");
    const year = request.nextUrl.searchParams.get("year");
    const month = request.nextUrl.searchParams.get("month");

    let accountDocs: FirebaseFirestore.DocumentSnapshot[] = [];

    if (accountId) {
      const doc = await db.collection("contas").doc(accountId).get();
      if (doc.exists && doc.data()?.userId === userId) accountDocs = [doc];
    } else if (acctid) {
      const snapshot = await db.collection("contas").where("acctid", "==", acctid).where("userId", "==", userId).get();
      accountDocs = snapshot.docs;
    } else {
      const snapshot = await db.collection("contas").where("userId", "==", userId).get();
      accountDocs = snapshot.docs;
    }

    if (fields === "metadata") {
      const data = accountDocs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return NextResponse.json({ data, count: data.length }, { status: 200 });
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

        const saldosRef = doc.ref.collection("saldos");
        const { start: saldoStartTimestamp, end: saldoEndTimestamp } = await resolveSaldoRange(
          saldosRef,
          years,
          year,
          month,
        );

        let saldosQuery: FirebaseFirestore.Query = saldosRef.orderBy("enddate");
        if (saldoStartTimestamp) {
          saldosQuery = saldosQuery.where("enddate", ">=", saldoStartTimestamp);
        }
        if (saldoEndTimestamp) {
          saldosQuery = saldosQuery.where("enddate", "<=", saldoEndTimestamp);
        }
        const saldosSnapshot = await saldosQuery.get();
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
        const saldosRef = doc.ref.collection("saldos");
        const { start: saldoStartTimestamp, end: saldoEndTimestamp } = await resolveSaldoRange(
          saldosRef,
          years,
          year,
          month,
        );

        let saldosQuery: FirebaseFirestore.Query = saldosRef.orderBy("enddate");
        if (saldoStartTimestamp) {
          saldosQuery = saldosQuery.where("enddate", ">=", saldoStartTimestamp);
        }
        if (saldoEndTimestamp) {
          saldosQuery = saldosQuery.where("enddate", "<=", saldoEndTimestamp);
        }
        const saldosSnapshot = await saldosQuery.get();
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
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
