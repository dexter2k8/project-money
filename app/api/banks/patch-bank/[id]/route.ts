import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { TPatchBankArgs } from "../../types";

export const runtime = "nodejs";

export async function PATCH(req: NextRequest) {
  const body: TPatchBankArgs = await req.json();

  const parsedBody: TPatchBankArgs = {
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

    const id = req.nextUrl.pathname.split("/").pop() ?? "";

    const { id: _, ...updateData } = parsedBody;
    void _;

    const db = admin.firestore();
    await db.collection("bancos").doc(id).update(updateData);

    return NextResponse.json("Bank updated successfully", { status: 200 });
  } catch (error) {
    console.error("Update bank error:", error);
    return NextResponse.json({ error: "Failed to update bank" }, { status: 500 });
  }
}
