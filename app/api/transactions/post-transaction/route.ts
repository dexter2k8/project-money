import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type TTransactionInput = {
  trntype: string;
  dtposted: string;
  trnamt: number;
  memo: string;
  chknum: string;
};

function normalizeString(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeAmount(value: number): string {
  return Number(value).toFixed(2);
}

function createTransactionKey(t: TTransactionInput | { trntype: string; dtposted: string; trnamt: number; memo: string; chknum: string }): string {
  const trntype = normalizeString(t.trntype);
  const dtposted = normalizeDate(t.dtposted);
  const trnamt = normalizeAmount(t.trnamt);
  const memo = normalizeString(t.memo);
  const chknum = normalizeString(t.chknum);
  return `${trntype}|${dtposted}|${trnamt}|${memo}|${chknum}`;
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const body = await request.json();
    const { acctid, transactions } = body as {
      acctid: string;
      transactions: TTransactionInput[];
    };

    if (!acctid) {
      return NextResponse.json({ error: "acctid is required" }, { status: 400 });
    }

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "transactions array is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const snapshot = await db.collection("contas").where("acctid", "==", acctid).get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountDoc = snapshot.docs[0];
    const extratosRef = accountDoc.ref.collection("extratos");

    const extratosSnapshot = await extratosRef.get();
    const existingKeys = new Set(
      extratosSnapshot.docs.map((doc) => {
        const data = doc.data();
        const dtposted = data.dtposted?.toDate?.().toISOString?.() ?? data.dtposted ?? "";
        return createTransactionKey({
          trntype: data.trntype ?? "",
          dtposted,
          trnamt: data.trnamt ?? 0,
          memo: data.memo ?? "",
          chknum: data.chknum ?? "",
        });
      }),
    );

    const uniqueTransactions = transactions.filter((txn) => {
      const key = createTransactionKey(txn);
      return !existingKeys.has(key);
    });

    if (uniqueTransactions.length === 0) {
      return NextResponse.json(
        { data: [], count: 0, skipped: transactions.length },
        { status: 200 },
      );
    }

    const batch = db.batch();
    const docRefs: FirebaseFirestore.DocumentReference[] = [];

    for (const txn of uniqueTransactions) {
      const docRef = extratosRef.doc();
      docRefs.push(docRef);
      batch.set(docRef, {
        trntype: txn.trntype,
        dtposted: admin.firestore.Timestamp.fromDate(new Date(txn.dtposted)),
        trnamt: txn.trnamt,
        memo: txn.memo,
        chknum: txn.chknum,
      });
    }

    await batch.commit();

    const insertedTransactions = uniqueTransactions.map((txn, index) => ({
      id: docRefs[index].id,
      ...txn,
    }));

    return NextResponse.json(
      { data: insertedTransactions, count: insertedTransactions.length },
      { status: 201 },
    );
  } catch (error) {
    console.error("Post transaction error:", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
