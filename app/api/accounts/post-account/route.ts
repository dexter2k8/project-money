import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
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
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
