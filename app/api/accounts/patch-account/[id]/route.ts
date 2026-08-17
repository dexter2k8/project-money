import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { TPatchAccountArgs } from "../../types";

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
    const body: TPatchAccountArgs = await req.json();

    const db = admin.firestore();
    await db.collection("contas").doc(id).update({
      acctid: body.acctid,
      accttype: body.accttype,
      bankid: body.bankid,
      branchid: body.branchid,
      description: body.description,
    });

    return NextResponse.json("Account updated successfully", { status: 200 });
  } catch (error) {
    console.error("Update account error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}
