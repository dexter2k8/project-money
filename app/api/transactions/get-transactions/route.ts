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

    const acctid = request.nextUrl.searchParams.get("acctid");
    const month = request.nextUrl.searchParams.get("month");
    const year = request.nextUrl.searchParams.get("year");

    if (!acctid) {
      return NextResponse.json({ error: "acctid is required" }, { status: 400 });
    }

    let startTimestamp: admin.firestore.Timestamp | null = null;
    let endTimestamp: admin.firestore.Timestamp | null = null;

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      startTimestamp = admin.firestore.Timestamp.fromDate(startDate);
      endTimestamp = admin.firestore.Timestamp.fromDate(endDate);
    }

    const db = admin.firestore();
    const snapshot = await db.collection("contas").where("acctid", "==", acctid).get();

    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {
        let extratosQuery: FirebaseFirestore.Query = doc.ref.collection("extratos");

        if (startTimestamp) {
          extratosQuery = extratosQuery.where("dtposted", ">=", startTimestamp);
        }
        if (endTimestamp) {
          extratosQuery = extratosQuery.where("dtposted", "<=", endTimestamp);
        }

        const extratosSnapshot = await extratosQuery.orderBy("dtposted", "asc").get();

        const extratos = extratosSnapshot.docs.map((e) => ({
          id: e.id,
          ...e.data(),
          dtposted: e.data().dtposted?.toDate?.().toISOString?.() ?? e.data().dtposted,
        }));

        return {
          id: doc.id,
          ...doc.data(),
          extratos,
        };
      }),
    );

    const count = data[0]?.extratos.length ?? 0;

    return NextResponse.json({ data, count }, { status: 200 });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
