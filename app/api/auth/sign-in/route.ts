import { signInWithCustomToken, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/app/services/firebase";
import type { NextRequest } from "next/server";
import type { TSignInArgs } from "./types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, avatar }: TSignInArgs = body;

    await signInWithEmailAndPassword(auth, email, password);
    const uid = auth.currentUser?.uid as string;
    const token = await admin.auth().createCustomToken(uid);

    const idToken = await signInWithCustomToken(auth, token)
      .then((userCredential) => userCredential.user.getIdToken())
      .catch((error) => {
        console.error("Authentication failed:", error);
      });

    if (auth.currentUser) {
      if (name) {
        updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: avatar,
        });
      }

      const cookieStore = await cookies();
      cookieStore.set({
        name: "project-money-token",
        value: idToken as string,
        httpOnly: true,
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
      });
    }
    return NextResponse.json(auth.currentUser, { status: 200 });
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }
}
