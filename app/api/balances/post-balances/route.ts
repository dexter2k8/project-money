import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

function getMonthKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0, 3, 0, 0));
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body = await request.json();
    const { accountId, startDate } = body as { accountId: string; startDate?: string };

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountDoc = await db.collection("contas").doc(accountId).get();

    if (!accountDoc.exists || accountDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const extratosRef = accountDoc.ref.collection("extratos");
    const saldosRef = accountDoc.ref.collection("saldos");

    const extratosSnapshot = await extratosRef.get();
    const allTransactions = extratosSnapshot.docs.map((doc) => {
      const data = doc.data();
      const raw = data.dtposted;
      let date: Date;
      if (raw && typeof raw === "object" && "toDate" in raw && typeof raw.toDate === "function") {
        date = raw.toDate();
      } else if (typeof raw === "string") {
        date = new Date(raw);
      } else {
        date = new Date(0);
      }
      return {
        dtposted: date,
        trnamt: (data.trnamt as number) ?? 0,
      };
    });

    allTransactions.sort((a, b) => a.dtposted.getTime() - b.dtposted.getTime());

    const startFilter = startDate ? new Date(startDate) : null;

    const filteredTransactions = startFilter
      ? allTransactions.filter((txn) => txn.dtposted >= startFilter)
      : allTransactions;

    let previousBalance = 0;

    const saldosSnapshot = await saldosRef.orderBy("enddate").get();

    if (startFilter) {
      const previousSaldos = saldosSnapshot.docs.filter((doc) => {
        const enddate = doc.data().enddate?.toDate?.();
        return enddate && enddate < startFilter;
      });
      if (previousSaldos.length > 0) {
        const lastSaldo = previousSaldos[previousSaldos.length - 1];
        previousBalance = (lastSaldo.data().balance as number) ?? 0;
      }
    }

    const transactionsByMonth = new Map<string, { dtposted: Date; trnamt: number }[]>();
    for (const txn of filteredTransactions) {
      const monthKey = getMonthKey(txn.dtposted);
      if (!transactionsByMonth.has(monthKey)) {
        transactionsByMonth.set(monthKey, []);
      }
      transactionsByMonth.get(monthKey)!.push(txn);
    }

    const existingSaldos = new Map<string, string>();
    for (const doc of saldosSnapshot.docs) {
      const data = doc.data();
      const enddate = data.enddate?.toDate?.();
      if (enddate) {
        const key = getMonthKey(enddate);
        existingSaldos.set(key, doc.id);
      }
    }

    const batch = admin.firestore().batch();

    const sortedMonths = Array.from(transactionsByMonth.keys()).sort();
    for (const monthKey of sortedMonths) {
      const txns = transactionsByMonth.get(monthKey)!;
      const monthTotal = txns.reduce((sum, txn) => sum + txn.trnamt, 0);
      const finalBalance = previousBalance + monthTotal;

      const [yearStr, monthStr] = monthKey.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const enddate = getLastDayOfMonth(year, month);

      const existingSaldoId = existingSaldos.get(monthKey);
      if (existingSaldoId) {
        const saldoDoc = saldosRef.doc(existingSaldoId);
        batch.update(saldoDoc, {
          balance: finalBalance,
          enddate: admin.firestore.Timestamp.fromDate(enddate),
        });
      } else {
        const saldoDoc = saldosRef.doc();
        batch.set(saldoDoc, {
          balance: finalBalance,
          enddate: admin.firestore.Timestamp.fromDate(enddate),
        });
      }

      previousBalance = finalBalance;
    }

    await batch.commit();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Post balances error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
