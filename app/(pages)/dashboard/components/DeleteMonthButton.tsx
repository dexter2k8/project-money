"use client";
import { useState } from "react";
import { toast } from "react-toastify";
import { mutate as mutateSWR } from "swr";
import { DeleteTransactions } from "@/app/services/fetchers/transactions";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

type TDeleteMonthButtonProps = {
  acctid: string;
  accountId: string;
  month: number;
  year: number;
};

export function DeleteMonthButton({ acctid, accountId, month, year }: TDeleteMonthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await DeleteTransactions({ acctid, month, year });
      toast.success("Transações excluídas com sucesso!");
      mutateSWR(`${API.BALANCES.GET_BALANCES}?accountId=${accountId}`);
    } catch {
      toast.error("Erro ao excluir transações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      cross
      title="Delete month transactions"
      subtitle="Are you sure you want to delete all transactions for this month?"
      labelApply="Delete"
      loadingApply={loading}
      onApply={handleApply}
      content={<div />}
    >
      <Button className="px-3 bg-red-500!" variant="primary">
        -
      </Button>
    </Modal>
  );
}
