"use client";
import { SquarePen } from "lucide-react";
import Button from "@/components/Button";
import { TransactionForm } from "./TransactionForm";
import type { TTransaction } from "@/app/api/accounts/types";

type TEditTransactionButtonProps = {
  acctid: string;
  accountId: string;
  transaction: TTransaction;
  onSuccess: () => void;
};

export function EditTransactionButton({
  acctid,
  accountId,
  transaction,
  onSuccess,
}: TEditTransactionButtonProps) {
  return (
    <TransactionForm
      mode="edit"
      acctid={acctid}
      accountId={accountId}
      transaction={transaction}
      onSuccess={onSuccess}
      trigger={
        <Button>
          <SquarePen size={16} />
        </Button>
      }
    />
  );
}
