import { NextResponse } from "next/server";
import { AuthError, requireAuth } from "@/app/api/utils/auth";
import { classifyError } from "@/app/api/utils/firebase-error";
import admin from "@/app/services/firebase-admin";
import { firestoreDateToString } from "@/app/utils/dates";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();

    const acctid = request.nextUrl.searchParams.get("acctid");
    const accountId = request.nextUrl.searchParams.get("accountId");
    const month = request.nextUrl.searchParams.get("month");
    const year = request.nextUrl.searchParams.get("year");
    const years = request.nextUrl.searchParams.get("years");

    if (!acctid && !accountId) {
      return NextResponse.json({ error: "acctid or accountId is required" }, { status: 400 });
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

    let accountDocs: FirebaseFirestore.DocumentSnapshot[] = [];

    if (accountId) {
      const doc = await db.collection("contas").doc(accountId).get();
      if (doc.exists && doc.data()?.userId === userId) accountDocs = [doc];
    } else {
      const snapshot = await db.collection("contas").where("acctid", "==", acctid).where("userId", "==", userId).get();
      accountDocs = snapshot.docs;
    }

    const data = await Promise.all(
      accountDocs.map(async (doc) => {
        let extratosQuery: FirebaseFirestore.Query = doc.ref.collection("extratos");

        if (years && !startTimestamp) {
          const latestSnapshot = await doc.ref.collection("extratos").orderBy("dtposted", "desc").limit(1).get();
          const latestDoc = latestSnapshot.docs[0];
          if (latestDoc) {
            const latestDate = latestDoc.data().dtposted.toDate();
            const filterDate = new Date(latestDate);
            filterDate.setUTCFullYear(filterDate.getUTCFullYear() - Number(years));
            startTimestamp = admin.firestore.Timestamp.fromDate(filterDate);
          }
        }

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
    const { status, message } = classifyError(error);
    return NextResponse.json({ error: message }, { status });
  }
}
