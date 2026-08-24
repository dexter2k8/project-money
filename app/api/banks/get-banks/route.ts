import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { TGetBankResponse } from "../types";

export const runtime = "nodejs";

export async function GET() {
  try {
    await requireAuth();

    const db = admin.firestore();
    const snapshot = await db.collection("bancos").get();

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TGetBankResponse[];

    const count = data.length;

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Get banks error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
