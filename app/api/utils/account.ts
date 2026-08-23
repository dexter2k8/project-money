import admin from "firebase-admin";

export async function findAccountByAcctid(
  acctid: string,
): Promise<FirebaseFirestore.DocumentSnapshot | null> {
  const db = admin.firestore();
  const snapshot = await db
    .collection("contas")
    .where("acctid", "==", acctid)
    .limit(1)
    .get();
  return snapshot.empty ? null : snapshot.docs[0];
}
