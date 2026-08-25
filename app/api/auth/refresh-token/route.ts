import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    const customToken = await admin.auth().createCustomToken(decoded.uid);

    const restResponse = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FIREBASE_APIKEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      },
    );

    const restResult = await restResponse.json();

    if (!restResponse.ok) {
      throw new Error(restResult.error?.message || "Failed to refresh token");
    }

    const newTokenDecoded = await admin.auth().verifyIdToken(restResult.idToken);

    const cookieStore2 = await cookies();
    cookieStore2.set({
      name: "project-money-token",
      value: restResult.idToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({ exp: newTokenDecoded.exp }, { status: 200 });
  } catch (error) {
    console.error("Refresh token error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
