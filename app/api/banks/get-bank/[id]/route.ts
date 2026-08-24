import admin from "firebase-admin";
import { type NextRequest, NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import type { TGetBankResponse } from "../../types";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();

    const { id } = await params;

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
    if (error instanceof AuthError) return error.response;
    console.error("Get bank error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
