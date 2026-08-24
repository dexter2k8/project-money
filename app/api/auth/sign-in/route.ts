import { signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { classifyError } from "@/app/api/utils/firebase-error";
import { auth } from "@/app/services/firebase";
import type { NextRequest } from "next/server";
import type { TSignInArgs } from "./types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, avatar }: TSignInArgs = body;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await userCredential.user.getIdToken();

    if (auth.currentUser && name) {
      updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: avatar,
      });
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: "project-money-token",
      value: idToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json(auth.currentUser, { status: 200 });
  } catch (error) {
    console.error("Sign-in error:", error);
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
