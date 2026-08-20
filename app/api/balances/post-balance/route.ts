import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { TPostSingleBalanceArgs } from "../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const body: TPostSingleBalanceArgs = await req.json();
    const { accountId, balance, enddate } = body;

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountRef = db.collection("contas").doc(accountId);
    const saldoRef = accountRef.collection("saldos").doc();

    await saldoRef.set({
      balance: balance,
      enddate: admin.firestore.Timestamp.fromDate(new Date(enddate)),
    });

    return NextResponse.json({ id: saldoRef.id, balance, enddate }, { status: 201 });
  } catch (error) {
    console.error("Create balance error:", error);
    return NextResponse.json({ error: "Failed to create balance" }, { status: 500 });
  }
}
