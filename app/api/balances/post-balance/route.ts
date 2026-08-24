import admin from "firebase-admin";
import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import { parseDateLocal } from "@/app/utils/dates";
import type { TPostSingleBalanceArgs } from "../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const body: TPostSingleBalanceArgs = await req.json();
    const { accountId, balance, enddate } = body;

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountDoc = await db.collection("contas").doc(accountId).get();

    if (!accountDoc.exists || accountDoc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const accountRef = db.collection("contas").doc(accountId);
    const saldoRef = accountRef.collection("saldos").doc();

    await saldoRef.set({
      balance: balance,
      enddate: admin.firestore.Timestamp.fromDate(parseDateLocal(enddate)),
    });

    return NextResponse.json({ id: saldoRef.id, balance, enddate }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Create balance error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
