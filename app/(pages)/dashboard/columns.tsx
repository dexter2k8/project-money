"use client";
import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { SquarePen } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { mutate as mutateSWR } from "swr";
import { PostBalances } from "@/app/services/fetchers/balances";
import {
  DeleteTransaction,
  DeleteTransactions,
  PatchTransaction,
  PostTransaction,
} from "@/app/services/fetchers/transactions";
import { API } from "@/app/utils/paths";
import { transactionSchema } from "@/app/validations/transaction";
import BalanceDisplay from "@/components/BalanceDisplay";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { ModalComponent } from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { TTransaction } from "@/app/api/accounts/types";
import type { TTransactionFormValues } from "@/app/validations/transaction";
import type { IGridColDef } from "@/components/Table";

export type TTransactionWithSaldo = TTransaction & { saldo: number };

type TColumnsArgs = {
  acctid: string;
  month: number;
  year: number;
  mutate: () => void;
};

function AddTransactionButton({ acctid, onSuccess }: { acctid: string; onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const result = await PostTransaction({
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
      });

      if (result.error) throw new Error(result.error);

      if (result.count === 0) {
        toast.info("Transação já existe no sistema.");
        return false;
      }

      await PostBalances(acctid);

      toast.success("Transação criada com sucesso!");
      reset();
      mutateSWR(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
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
      <Button className="px-3" variant="primary" onClick={() => setIsOpen(true)}>
        +
      </Button>
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

function EditTransactionButton({
  acctid,
  transaction,
  onSuccess,
}: {
  acctid: string;
  transaction: TTransaction;
  onSuccess: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const result = await PatchTransaction({
        acctid,
        transactionId: transaction.id,
        data: {
          dtposted: data.dtposted,
          trnamt: data.trnamt,
          memo: data.memo,
          chknum: data.chknum || "",
        },
      });

      if (result.error) throw new Error(result.error);

      await PostBalances(acctid);

      toast.success("Transação atualizada com sucesso!");
      reset();
      mutateSWR(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
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

  const handleDelete = async () => {
    setLoading(true);
    try {
      await DeleteTransaction({ acctid, transactionId: transaction.id });

      await PostBalances(acctid);

      toast.success("Transação excluída com sucesso!");
      mutateSWR(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
      setIsOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Erro ao excluir transação.");
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
      <Button onClick={() => setIsOpen(true)}>
        <SquarePen size={16} />
      </Button>
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
          <div className="flex gap-4">
            <Input
              type="date"
              label="Data"
              {...register("dtposted")}
              status={errors.dtposted ? "error" : "info"}
              message={errors.dtposted?.message}
            />
            <Button
              className="px-3 bg-red-500!"
              variant="primary"
              onClick={handleDelete}
              disabled={loading}
            >
              -
            </Button>
          </div>
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

function DeleteMonthButton({
  acctid,
  month,
  year,
  onSuccess,
}: {
  acctid: string;
  month: number;
  year: number;
  onSuccess: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    try {
      await DeleteTransactions({ acctid, month, year });
      toast.success("Transações excluídas com sucesso!");
      mutateSWR(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
      setIsOpen(false);
      onSuccess();
    } catch {
      toast.error("Erro ao excluir transações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button className="px-3 bg-red-500!" variant="primary" onClick={() => setIsOpen(true)}>
        -
      </Button>
      <ModalComponent
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={handleApply}
        title="Delete month transactions"
        subtitle="Are you sure you want to delete all transactions for this month?"
        labelApply="Delete"
        loadingApply={loading}
        cross
      >
        <div />
      </ModalComponent>
    </>
  );
}

export const columns = ({
  acctid,
  month,
  year,
  mutate,
}: TColumnsArgs): IGridColDef<TTransactionWithSaldo>[] => [
  {
    field: "id",
    header: "UID",
    className: "text-center w-10",
    renderHeader() {
      return <AddTransactionButton acctid={acctid} onSuccess={mutate} />;
    },
    render: (_value, row) => (
      <EditTransactionButton
        acctid={acctid}
        transaction={row}
        onSuccess={mutate}
      />
    ),
    renderFooter: () => (
      <DeleteMonthButton
        acctid={acctid}
        month={month}
        year={year}
        onSuccess={mutate}
      />
    ),
  },
  {
    field: "dtposted",
    header: "Data",
    className: "text-left w-28",
    render: (value) => {
      if (!value) return "";
      const date = new Date(value);
      const day = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const y = date.getFullYear();
      return `${day}/${m}/${y}`;
    },
  },
  { field: "memo", className: "text-left max-w-80 truncate", header: "Descrição" },
  { field: "chknum", className: "text-right w-28", header: "Documento" },
  {
    field: "trnamt",
    header: "Valor",
    className: "text-right",
    render: (value) => <BalanceDisplay value={Number(value)} />,
  },
  {
    field: "saldo",
    header: "Saldo",
    className: "text-right",
    render: (value) => <BalanceDisplay value={Number(value)} />,
  },
];
