import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { TGetBankResponse } from "../../types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const id = req.nextUrl.pathname.split("/").pop() ?? "";

    const db = admin.firestore();
    const doc = await db.collection("bancos").doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Bank not found" }, { status: 404 });
    }

    const data = {
      id: doc.id,
      ...doc.data(),
    } as TGetBankResponse;

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Get bank error:", error);
    return NextResponse.json({ error: "Failed to fetch bank" }, { status: 500 });
  }
}
