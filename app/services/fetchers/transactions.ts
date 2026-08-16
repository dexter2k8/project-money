import { NextResponse } from "next/server";
import { API } from "@/app/utils/paths";

type TDeleteTransactionArgs = {
  acctid: string;
  transactionId: string;
};

async function DeleteTransaction({ acctid, transactionId }: TDeleteTransactionArgs) {
  try {
    const response = await fetch(API.TRANSACTIONS.DELETE_TRANSACTION, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acctid, transactionId }),
    });
    return response.json();
  } catch (error) {
    console.error("Delete transaction error:", error);
    return NextResponse.json({ error: "Failed to delete transaction" }, { status: 500 });
  }
}

type TDeleteTransactionsArgs = {
  acctid: string;
  month: number;
  year: number;
};

async function DeleteTransactions({ acctid, month, year }: TDeleteTransactionsArgs) {
  try {
    const response = await fetch(API.TRANSACTIONS.DELETE_TRANSACTIONS, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acctid, month, year }),
    });
    return response.json();
  } catch (error) {
    console.error("Delete transactions error:", error);
    return NextResponse.json({ error: "Failed to delete transactions" }, { status: 500 });
  }
}

export { DeleteTransaction, DeleteTransactions };
