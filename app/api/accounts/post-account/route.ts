import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { NextRequest } from "next/server";
import type { TPostAccountArgs } from "../types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();

    const body: TPostAccountArgs = await req.json();

    const db = admin.firestore();
    const docRef = await db.collection("contas").add({
      acctid: body.acctid,
      accttype: body.accttype,
      bankid: body.bankid,
      branchid: body.branchid,
      description: body.description,
      userId,
    });

    return NextResponse.json({ id: docRef.id, ...body }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return error.response;
    console.error("Create account error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
