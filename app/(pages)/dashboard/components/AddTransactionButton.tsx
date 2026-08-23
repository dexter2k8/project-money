"use client";
import Button from "@/components/Button";
import { TransactionForm } from "./TransactionForm";

type TAddTransactionButtonProps = {
  acctid: string;
  accountId: string;
  onSuccess: () => void;
};

export function AddTransactionButton({ acctid, accountId, onSuccess }: TAddTransactionButtonProps) {
  return (
    <TransactionForm
      mode="add"
      acctid={acctid}
      accountId={accountId}
      onSuccess={onSuccess}
      trigger={
        <Button className="px-3" variant="primary">
          +
        </Button>
      }
    />
  );
}
