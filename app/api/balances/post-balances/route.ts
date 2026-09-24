import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { NextRequest } from "next/server";

dayjs.extend(utc);
dayjs.extend(timezone);

export const runtime = "nodejs";

const BRT_TZ = "America/Sao_Paulo";

function getMonthKey(date: Date): string {
  const brt = dayjs(date).tz(BRT_TZ);
  return brt.format("YYYY-MM");
}

function getLastDayOfMonth(year: number, month: number): Date {
  const lastDay = dayjs.tz(`${year}-${String(month).padStart(2, "0")}-01`, BRT_TZ).endOf("month");
  return lastDay.startOf("day").toDate();
}

interface IPostBalancesBody {
  accountId: string;
  startDate?: string;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const body: IPostBalancesBody = await request.json();
    const { accountId, startDate } = body;

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

    const startFilter = startDate ? new Date(startDate) : null;
    const startTimestamp = startFilter ? admin.firestore.Timestamp.fromDate(startFilter) : null;

    let extratosQuery: FirebaseFirestore.Query = extratosRef.select("dtposted", "trnamt");
    if (startTimestamp) {
      extratosQuery = extratosQuery.where("dtposted", ">=", startTimestamp);
    }

    const extratosSnapshot = await extratosQuery.get();
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

    const filteredTransactions = startFilter
      ? allTransactions.filter((txn) => txn.dtposted >= startFilter)
      : allTransactions;

    let previousBalance = 0;
    const existingSaldos = new Map<string, string>();

    const collectExistingSaldos = (docs: FirebaseFirestore.QueryDocumentSnapshot[]) => {
      for (const doc of docs) {
        const enddate = doc.data().enddate?.toDate?.();
        if (enddate) {
          existingSaldos.set(getMonthKey(enddate), doc.id);
        }
      }
    };

    if (startFilter && startTimestamp) {
      const monthStartTimestamp = admin.firestore.Timestamp.fromDate(
        dayjs(startFilter).tz(BRT_TZ).startOf("month").toDate(),
      );

      const [previousSaldoSnapshot, saldosToRecalculateSnapshot] = await Promise.all([
        saldosRef
          .select("balance", "enddate")
          .where("enddate", "<", startTimestamp)
          .orderBy("enddate", "desc")
          .limit(1)
          .get(),
        saldosRef
          .select("balance", "enddate")
          .where("enddate", ">=", monthStartTimestamp)
          .orderBy("enddate")
          .get(),
      ]);

      const previousSaldo = previousSaldoSnapshot.docs[0];
      if (previousSaldo) {
        previousBalance = (previousSaldo.data().balance as number) ?? 0;
      }

      collectExistingSaldos(saldosToRecalculateSnapshot.docs);
    } else {
      const saldosSnapshot = await saldosRef.select("balance", "enddate").orderBy("enddate").get();
      collectExistingSaldos(saldosSnapshot.docs);
    }

    const transactionsByMonth = new Map<string, { dtposted: Date; trnamt: number }[]>();
    for (const txn of filteredTransactions) {
      const monthKey = getMonthKey(txn.dtposted);
      if (!transactionsByMonth.has(monthKey)) {
        transactionsByMonth.set(monthKey, []);
      }
      transactionsByMonth.get(monthKey)!.push(txn);
    }

    const batch = admin.firestore().batch();

    const sortedMonths = Array.from(transactionsByMonth.keys()).sort();
    for (const monthKey of sortedMonths) {
      const txns = transactionsByMonth.get(monthKey)!;
      const monthTotal = txns.reduce((sum, txn) => sum + txn.trnamt, 0);
      const rawBalance = previousBalance + monthTotal;
      const finalBalance = Math.abs(rawBalance) < 0.005 ? 0 : rawBalance;

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
