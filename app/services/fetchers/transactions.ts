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
  const response = await fetch(API.TRANSACTIONS.POST_TRANSACTION, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acctid, transactions }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao criar transação");
  return json;
}

type TPatchTransactionArgs = {
  acctid: string;
  transactionId: string;
  data: {
    dtposted: string;
    trnamt: number;
    memo: string;
    chknum: string;
    trntype?: string;
  };
};

async function PatchTransaction({ acctid, transactionId, data }: TPatchTransactionArgs) {
  const response = await fetch(API.TRANSACTIONS.PATCH_TRANSACTION, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acctid, transactionId, data }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao atualizar transação");
  return json;
}

type TDeleteTransactionArgs = {
  acctid: string;
  transactionId: string;
};

async function DeleteTransaction({ acctid, transactionId }: TDeleteTransactionArgs) {
  const response = await fetch(API.TRANSACTIONS.DELETE_TRANSACTION, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acctid, transactionId }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao excluir transação");
  return json;
}

type TDeleteTransactionsArgs = {
  acctid: string;
  month: number;
  year: number;
};

async function DeleteTransactions({ acctid, month, year }: TDeleteTransactionsArgs) {
  const response = await fetch(API.TRANSACTIONS.DELETE_TRANSACTIONS, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ acctid, month, year }),
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json.error || "Erro ao excluir transações");
  return json;
}

export { PostTransaction, PatchTransaction, DeleteTransaction, DeleteTransactions };
