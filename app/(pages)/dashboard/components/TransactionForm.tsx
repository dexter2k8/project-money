"use client";
import { useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { mutate as mutateSWR } from "swr";
import { PostBalances } from "@/app/services/fetchers/balances";
import {
  DeleteTransaction,
  PatchTransaction,
  PostTransaction,
} from "@/app/services/fetchers/transactions";
import { API } from "@/app/utils/paths";
import { transactionSchema } from "@/app/validations/transaction";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { TTransaction } from "@/app/api/accounts/types";
import type { TTransactionFormValues } from "@/app/validations/transaction";

type TTransactionFormProps = {
  mode: "add" | "edit";
  acctid: string;
  transaction?: TTransaction;
  onSuccess: () => void;
  trigger: React.ReactNode;
};

export function TransactionForm({
  mode,
  acctid,
  transaction,
  onSuccess,
  trigger,
}: TTransactionFormProps) {
  const closeRef = useRef<{ close: () => void }>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TTransactionFormValues>({
    resolver: yupResolver(transactionSchema) as never,
    defaultValues:
      mode === "edit" && transaction
        ? {
            dtposted: transaction.dtposted
              ? new Date(transaction.dtposted).toISOString().split("T")[0]
              : "",
            memo: transaction.memo || "",
            chknum: transaction.chknum || "",
            trnamt: transaction.trnamt || 0,
            trntype: "OTHER",
          }
        : {
            dtposted: new Date().toISOString().split("T")[0],
            memo: "",
            chknum: "",
            trnamt: 0,
            trntype: "OTHER",
          },
  });

  const refreshBalances = async (startDate?: string) => {
    await PostBalances(acctid, startDate);
    mutateSWR(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
  };

  const handleApply = async (data: TTransactionFormValues) => {
    setLoading(true);
    try {
      if (mode === "add") {
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
      } else {
        const result = await PatchTransaction({
          acctid,
          transactionId: transaction!.id,
          data: {
            dtposted: data.dtposted,
            trnamt: data.trnamt,
            memo: data.memo,
            chknum: data.chknum || "",
          },
        });
        if (result.error) throw new Error(result.error);
      }

      await refreshBalances(data.dtposted);
      toast.success(mode === "add" ? "Transação criada com sucesso!" : "Transação atualizada com sucesso!");
      reset();
      onSuccess();
      return true;
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error(mode === "add" ? "Erro ao criar transação." : "Erro ao atualizar transação.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await DeleteTransaction({ acctid, transactionId: transaction!.id });
      await refreshBalances(transaction!.dtposted);
      toast.success("Transação excluída com sucesso!");
      mutateSWR(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
      closeRef.current?.close();
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
  };

  const title = mode === "add" ? "Adicionar Transação" : "Editar Transação";

  return (
    <Modal
      cross
      title={title}
      labelApply="Salvar"
      loadingApply={loading}
      onClose={handleClose}
      onApply={handleSubmit(handleApply) as () => Promise<boolean | void>}
      closeRef={closeRef}
      content={
        <form className="flex flex-col gap-4 p-4 w-100">
          <div className="flex gap-4">
            <Input
              type="date"
              label="Data"
              {...register("dtposted")}
              status={errors.dtposted ? "error" : "info"}
              message={errors.dtposted?.message}
            />
            {mode === "edit" && (
              <Button
                className="px-3 bg-red-500!"
                variant="primary"
                onClick={handleDelete}
                disabled={loading}
              >
                -
              </Button>
            )}
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
      }
    >
      {trigger}
    </Modal>
  );
}
