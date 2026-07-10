import type { TTransaction } from "@/app/api/accounts/types";
import type { TParsedTransaction } from "./parseOfx";

function normalizeString(value: string | undefined | null): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeDate(dateStr: string): string {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function normalizeAmount(value: number): string {
  return Number(value).toFixed(2);
}

function createTransactionKey(t: TParsedTransaction | TTransaction): string {
  const trntype = normalizeString(t.trntype);
  const dtposted = normalizeDate(t.dtposted);
  const trnamt = normalizeAmount(t.trnamt);
  const memo = normalizeString(t.memo);
  const chknum = normalizeString(t.chknum);

  return `${trntype}|${dtposted}|${trnamt}|${memo}|${chknum}`;
}

export function filterUniqueTransactions(
  parsed: TParsedTransaction[],
  existing: TTransaction[],
): TParsedTransaction[] {
  const existingKeys = new Set(existing.map(createTransactionKey));

  return parsed.filter((t) => !existingKeys.has(createTransactionKey(t)));
}
