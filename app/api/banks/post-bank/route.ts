import admin from "firebase-admin";
import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import type { TPostBankArgs } from "../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();

    const body: TPostBankArgs = await req.json();
    const { id, ...data } = body;

    const db = admin.firestore();
    await db.collection("bancos").doc(id).set(data);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Create bank error:", error);
    return NextResponse.json({ error: "Failed to create bank" }, { status: 500 });
  }
}
