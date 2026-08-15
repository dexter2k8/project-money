"use client";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useSWRConfig } from "swr";
import { DeleteTransactions } from "@/app/services/fetchers/transactions";
import { API } from "@/app/utils/paths";
import { transactionSchema } from "@/app/validations/transaction";
import Input from "@/components/Input";
import { ModalComponent } from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { TTransactionFormValues } from "@/app/validations/transaction";

type TAddTransactionModalProps = {
  acctid: string;
  onSuccess: () => void;
};

export function AddTransactionModal({ acctid, onSuccess }: TAddTransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TTransactionFormValues>({
    resolver: yupResolver(transactionSchema) as never,
    defaultValues: {
      dtposted: new Date().toISOString().split("T")[0],
      memo: "",
      chknum: "",
      trnamt: 0,
      trntype: "OTHER",
    },
  });

  const handleApply = async (data: TTransactionFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(API.TRANSACTIONS.POST_TRANSACTION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acctid,
          transactions: [
            {
              trntype: data.trntype || "OTHER",
              dtposted: data.dtposted,
              trnamt: data.trnamt,
              memo: data.memo,
              chknum: data.chknum || "",
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar transação");
      }

      const result = await response.json();

      if (result.count === 0) {
        toast.info("Transação já existe no sistema.");
        return false;
      }

      await fetch(API.BALANCES.POST_BALANCES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acctid }),
      });

      toast.success("Transação criada com sucesso!");
      reset();
      mutate(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error creating transaction:", error);
      toast.error("Erro ao criar transação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>+</span>
      <ModalComponent
        isOpen={isOpen}
        onClose={handleClose}
        onApply={handleSubmit(handleApply) as () => Promise<boolean | void>}
        title="Adicionar Transação"
        labelApply="Salvar"
        loadingApply={loading}
        cross
      >
        <form className="flex flex-col gap-4 p-4 w-100">
          <Input
            type="date"
            label="Data"
            {...register("dtposted")}
            status={errors.dtposted ? "error" : "info"}
            message={errors.dtposted?.message}
          />
          <TextArea
            showCounter
            maxLength={100}
            label="Descrição"
            {...register("memo")}
            status={errors.memo ? "error" : "info"}
            message={errors.memo?.message}
          />
          <Input
            label="Documento"
            {...register("chknum")}
            status={errors.chknum ? "error" : "info"}
            message={errors.chknum?.message}
          />
          <Input
            label="Valor"
            type="number"
            step="0.01"
            {...register("trnamt", { valueAsNumber: true })}
            status={errors.trnamt ? "error" : "info"}
            message={errors.trnamt?.message}
          />
        </form>
      </ModalComponent>
    </>
  );
}

type TEditTransactionModalProps = {
  acctid: string;
  transaction: {
    id: string;
    dtposted: string;
    memo: string;
    chknum: string;
    trnamt: number;
  };
  onSuccess: () => void;
};

export function EditTransactionModal({
  acctid,
  transaction,
  onSuccess,
}: TEditTransactionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TTransactionFormValues>({
    resolver: yupResolver(transactionSchema) as never,
    defaultValues: {
      dtposted: transaction.dtposted
        ? new Date(transaction.dtposted).toISOString().split("T")[0]
        : "",
      memo: transaction.memo || "",
      chknum: transaction.chknum || "",
      trnamt: transaction.trnamt || 0,
      trntype: "OTHER",
    },
  });

  const handleApply = async (data: TTransactionFormValues) => {
    setLoading(true);
    try {
      const response = await fetch(API.TRANSACTIONS.PATCH_TRANSACTION, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          acctid,
          transactionId: transaction.id,
          data: {
            dtposted: data.dtposted,
            trnamt: data.trnamt,
            memo: data.memo,
            chknum: data.chknum || "",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao atualizar transação");
      }

      await fetch(API.BALANCES.POST_BALANCES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acctid }),
      });

      toast.success("Transação atualizada com sucesso!");
      reset();
      mutate(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Erro ao atualizar transação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>{transaction.memo}</span>
      <ModalComponent
        isOpen={isOpen}
        onClose={handleClose}
        onApply={handleSubmit(handleApply) as () => Promise<boolean | void>}
        title="Editar Transação"
        labelApply="Salvar"
        loadingApply={loading}
        cross
      >
        <form className="flex flex-col gap-4 p-4 w-100">
          <Input
            type="date"
            label="Data"
            {...register("dtposted")}
            status={errors.dtposted ? "error" : "info"}
            message={errors.dtposted?.message}
          />
          <TextArea
            showCounter
            maxLength={100}
            label="Descrição"
            {...register("memo")}
            status={errors.memo ? "error" : "info"}
            message={errors.memo?.message}
          />
          <Input
            label="Documento"
            {...register("chknum")}
            status={errors.chknum ? "error" : "info"}
            message={errors.chknum?.message}
          />
          <Input
            label="Valor"
            type="number"
            step="0.01"
            {...register("trnamt", { valueAsNumber: true })}
            status={errors.trnamt ? "error" : "info"}
            message={errors.trnamt?.message}
          />
        </form>
      </ModalComponent>
    </>
  );
}

type TDeleteTransactionsModalProps = {
  acctid: string;
  month: number;
  year: number;
  onSuccess: () => void;
};

export function DeleteTransactionsModal({
  acctid,
  month,
  year,
  onSuccess,
}: TDeleteTransactionsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const handleApply = async () => {
    setLoading(true);
    try {
      const result = await DeleteTransactions({ acctid, month: month + 1, year });

      if (result.error) {
        throw new Error(result.error);
      }

      await fetch(API.BALANCES.POST_BALANCES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acctid }),
      });

      toast.success("Transações excluídas com sucesso!");
      mutate(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error deleting transactions:", error);
      toast.error("Erro ao excluir transações.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span onClick={() => setIsOpen(true)}>-</span>
      <ModalComponent
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={handleApply}
        title="Excluir Transações do Mês"
        subtitle="Tem certeza que deseja excluir todas as transações deste mês?"
        labelApply="Excluir"
        loadingApply={loading}
        cross
      >
        <div />
      </ModalComponent>
    </>
  );
}
