import admin from "firebase-admin";
import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { firestoreDateToString } from "@/app/utils/dates";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const acctid = request.nextUrl.searchParams.get("acctid");
    const month = request.nextUrl.searchParams.get("month");
    const year = request.nextUrl.searchParams.get("year");

    if (!acctid) {
      return NextResponse.json({ error: "acctid is required" }, { status: 400 });
    }

    let startTimestamp: admin.firestore.Timestamp | null = null;
    let endTimestamp: admin.firestore.Timestamp | null = null;

    if (month && year) {
      const startDate = new Date(Date.UTC(Number(year), Number(month) - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(Number(year), Number(month), 0, 23, 59, 59));
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
          dtposted: firestoreDateToString(e.data().dtposted),
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
    if (error instanceof AuthError) return error.response;
    console.error("Get transactions error:", error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
