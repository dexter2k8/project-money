import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { findAccountByAcctid } from "@/app/api/utils/account";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { firestoreDateToString } from "@/app/utils/dates";
import { createTransactionKey } from "@/app/utils/duplicateCheck";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

type TTransactionInput = {
  trntype: string;
  dtposted: string;
  trnamt: number;
  memo: string;
  chknum: string;
};

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

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

    const accountDoc = await findAccountByAcctid(acctid);
    if (!accountDoc) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const extratosRef = accountDoc.ref.collection("extratos");
    const extratosSnapshot = await extratosRef
      .select("trntype", "dtposted", "trnamt", "memo", "chknum")
      .get();
    const existingKeys = new Set(
      extratosSnapshot.docs.map((doc) => {
        const data = doc.data();
        return createTransactionKey({
          trntype: data.trntype ?? "",
          dtposted: firestoreDateToString(data.dtposted),
          trnamt: data.trnamt ?? 0,
          memo: data.memo ?? "",
          chknum: data.chknum ?? "",
        });
      }),
    );

    const uniqueTransactions = transactions.filter(
      (txn) => !existingKeys.has(createTransactionKey(txn)),
    );

    if (uniqueTransactions.length === 0) {
      return NextResponse.json(
        { data: [], count: 0, skipped: transactions.length },
        { status: 200 },
      );
    }

    const batch = admin.firestore().batch();
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
    if (error instanceof AuthError) return error.response;
    console.error("Post transaction error:", error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
