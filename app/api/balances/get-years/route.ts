import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const db = admin.firestore();
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const doc = await db.collection("contas").doc(accountId).get();
    if (!doc.exists || doc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const saldosSnapshot = await doc.ref.collection("saldos").orderBy("enddate").get();

    const yearsMap = new Map<number, Set<number>>();

    for (const saldoDoc of saldosSnapshot.docs) {
      const enddate = saldoDoc.data().enddate?.toDate();
      if (!enddate) continue;

      const year = enddate.getUTCFullYear();
      const month = enddate.getUTCMonth();

      if (!yearsMap.has(year)) {
        yearsMap.set(year, new Set());
      }
      yearsMap.get(year)!.add(month);
    }

    const years = Array.from(yearsMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, months]) => ({
        year,
        months: Array.from(months).sort((a, b) => a - b),
      }));

    return NextResponse.json({ data: years }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Get years error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
