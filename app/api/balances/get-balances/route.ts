import admin from "firebase-admin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("project-money-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await admin.auth().verifyIdToken(token);

    const db = admin.firestore();
    const acctid = request.nextUrl.searchParams.get("acctid");

    let snapshot: FirebaseFirestore.QuerySnapshot;

    if (acctid) {
      snapshot = await db.collection("contas").where("acctid", "==", acctid).get();
    } else {
      snapshot = await db.collection("contas").get();
    }

    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {
        if (acctid) {
          const saldosSnapshot = await doc.ref.collection("saldos").orderBy("enddate").get();
          const saldos = saldosSnapshot.docs.map((s) => ({
            id: s.id,
            ...s.data(),
            enddate: s.data().enddate?.toDate?.().toISOString?.() ?? s.data().enddate,
          }));
          return {
            id: doc.id,
            ...doc.data(),
            saldos,
          };
        }
        return {
          id: doc.id,
          ...doc.data(),
          saldos: [],
        };
      }),
    );

    const count = data[0]?.saldos.length ?? 0;

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    console.error("Get balances error:", error);
    return NextResponse.json({ error: "Failed to fetch balances" }, { status: 500 });
  }
}
