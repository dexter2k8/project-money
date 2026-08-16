import { NextResponse } from "next/server";
import { API } from "@/app/utils/paths";

type TPostTransactionArgs = {
  acctid: string;
  transactions: {
    trntype: string;
    dtposted: string;
    trnamt: number;
    memo: string;
    chknum: string;
  }[];
};

async function PostTransaction({ acctid, transactions }: TPostTransactionArgs) {
  try {
    const response = await fetch(API.TRANSACTIONS.POST_TRANSACTION, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acctid, transactions }),
    });
    return response.json();
  } catch (error) {
    console.error("Post transaction error:", error);
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 });
  }
}

type TPatchTransactionArgs = {
  acctid: string;
  transactionId: string;
  data: {
    dtposted: string;
    trnamt: number;
    memo: string;
    chknum: string;
  };
};

async function PatchTransaction({ acctid, transactionId, data }: TPatchTransactionArgs) {
  try {
    const response = await fetch(API.TRANSACTIONS.PATCH_TRANSACTION, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acctid, transactionId, data }),
    });
    return response.json();
  } catch (error) {
    console.error("Patch transaction error:", error);
    return NextResponse.json({ error: "Failed to update transaction" }, { status: 500 });
  }
}

type TDeleteTransactionArgs = {
  acctid: string;
  transactionId: string;
}

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

export { PostTransaction, PatchTransaction, DeleteTransaction, DeleteTransactions };
