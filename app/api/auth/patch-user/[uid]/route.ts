import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import type { TPatchUserArgs } from "../types";

export async function PATCH(req: NextRequest) {
  const body: TPatchUserArgs = await req.json();

  const parsedBody: TPatchUserArgs = {
    displayName: body.displayName,
    photoURL: body.photoURL,
    password: body.password,
    email: body.email,
  };

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const uid = req.nextUrl.pathname.split("/").pop() ?? "";

    await admin.auth().updateUser(uid, { ...parsedBody });

    return NextResponse.json("User updated successfully", { status: 200 });
  } catch (error) {
    console.error("Update user error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
