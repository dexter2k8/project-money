import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { NextRequest } from "next/server";
import type { TPatchAccountArgs } from "../../types";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const id = req.nextUrl.pathname.split("/").pop() ?? "";
    const body: TPatchAccountArgs = await req.json();

    const db = admin.firestore();
    const doc = await db.collection("contas").doc(id).get();

    if (!doc.exists || doc.data()?.userId !== userId) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    await db.collection("contas").doc(id).update({
      acctid: body.acctid,
      accttype: body.accttype,
      bankid: body.bankid,
      branchid: body.branchid,
      description: body.description,
    });

    return NextResponse.json("Account updated successfully", { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Update account error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
