"use client";
import Button from "@/components/Button";
import { TransactionForm } from "./TransactionForm";

type TAddTransactionButtonProps = {
  acctid: string;
  onSuccess: () => void;
};

export function AddTransactionButton({ acctid, onSuccess }: TAddTransactionButtonProps) {
  return (
    <TransactionForm
      mode="add"
      acctid={acctid}
      onSuccess={onSuccess}
      trigger={
        <Button className="px-3" variant="primary">
          +
        </Button>
      }
    />
  );
}
