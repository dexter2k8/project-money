import admin from "firebase-admin";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
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
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
