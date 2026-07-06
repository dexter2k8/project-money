import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { TPostBankArgs } from "../../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body: TPostBankArgs = await req.json();

  const parsedBody: TPostBankArgs = {
    id: body.id,
    name: body.name,
    alias: body.alias,
  };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const { id, ...data } = parsedBody;
    const db = admin.firestore();
    await db.collection("bancos").doc(id).set(data);

    return NextResponse.json("Bank created successfully", { status: 201 });
  } catch (error) {
    console.error("Create bank error:", error);
    return NextResponse.json({ error: "Failed to create bank" }, { status: 500 });
  }
}
