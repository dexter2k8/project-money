import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { auth } from "@/app/services/firebase";
import type { NextRequest } from "next/server";
import type { TPostUserArgs } from "./types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, displayName, photoURL }: TPostUserArgs = body;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (user && displayName) {
      updateProfile(user, {
        displayName: displayName,
        photoURL: photoURL,
      });
    }

    const uid = user.uid;
    await admin.auth().setCustomUserClaims(uid, { role: "user" });

    return NextResponse.json(auth.currentUser, { status: 200 });
  } catch (error) {
    console.error("Sign-up error:", error);

    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}
