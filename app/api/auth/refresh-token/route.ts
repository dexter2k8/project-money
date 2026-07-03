import { signInWithCustomToken } from "firebase/auth";
import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/app/services/firebase";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    const customToken = await admin.auth().createCustomToken(decoded.uid);

    const idToken = await signInWithCustomToken(auth, customToken)
      .then((cred) => cred.user.getIdToken())
      .catch((error) => {
        console.error("Token refresh failed:", error);
      });

    if (!idToken) {
      return NextResponse.json({ error: "Failed to refresh token" }, { status: 500 });
    }

    cookieStore.set({
      name: "project-money-token",
      value: idToken,
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    const newDecoded = await admin.auth().verifyIdToken(idToken);

    return NextResponse.json({ exp: newDecoded.exp }, { status: 200 });
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
