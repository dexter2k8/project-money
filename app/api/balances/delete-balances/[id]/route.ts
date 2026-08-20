import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const id = req.nextUrl.pathname.split("/").pop() ?? "";
    const accountId = req.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    }

    const db = admin.firestore();
    const accountRef = db.collection("contas").doc(accountId);
    const saldoRef = accountRef.collection("saldos").doc(id);

    await saldoRef.delete();

    return NextResponse.json("Balance deleted successfully", { status: 200 });
  } catch (error) {
    console.error("Delete balance error:", error);
    return NextResponse.json({ error: "Failed to delete balance" }, { status: 500 });
  }
}
