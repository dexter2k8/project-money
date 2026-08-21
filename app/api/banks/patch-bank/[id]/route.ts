import admin from "firebase-admin";
import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import type { TPatchBankArgs } from "../../types";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await params;
    const body: TPatchBankArgs = await req.json();
    const { id: _, ...updateData } = body;
    void _;

    const db = admin.firestore();
    await db.collection("bancos").doc(id).update(updateData);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Update bank error:", error);
    return NextResponse.json({ error: "Failed to update bank" }, { status: 500 });
  }
}
