import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { TPatchBalanceArgs } from "../../types";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const id = req.nextUrl.pathname.split("/").pop() ?? "";
    const body: TPatchBalanceArgs = await req.json();
    const accountId = req.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountRef = db.collection("contas").doc(accountId);
    const saldoRef = accountRef.collection("saldos").doc(id);

    await saldoRef.update({
      balance: body.balance,
      enddate: admin.firestore.Timestamp.fromDate(new Date(body.enddate)),
    });

    return NextResponse.json("Balance updated successfully", { status: 200 });
  } catch (error) {
    console.error("Update balance error:", error);
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}
