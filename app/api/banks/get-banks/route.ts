import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { TGetBankResponse } from "../../types";

export const runtime = "nodejs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const db = admin.firestore();
    const snapshot = await db.collection("bancos").get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TGetBankResponse[];

    const count = data.length;

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    console.error("Get banks error:", error);
    return NextResponse.json({ error: "Failed to fetch banks" }, { status: 500 });
  }
}
