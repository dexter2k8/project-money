"use client";
import { useRef, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { mutate as mutateSWR } from "swr";
import { PostBalances } from "@/app/services/fetchers/balances";
import { PostTransaction } from "@/app/services/fetchers/transactions";
import { API } from "@/app/utils/paths";
import { transactionSchema } from "@/app/validations/transaction";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { TTransactionFormValues } from "@/app/validations/transaction";

type TAddTransactionButtonProps = {
  acctid: string;
  onSuccess: () => void;
};

export function AddTransactionButton({ acctid, onSuccess }: TAddTransactionButtonProps) {
  const closeRef = useRef<{ close: () => void }>(null);
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
  };

  return (
    <Modal
      cross
      title="Adicionar Transação"
      labelApply="Salvar"
      loadingApply={loading}
      onClose={handleClose}
      onApply={handleSubmit(handleApply) as () => Promise<boolean | void>}
      closeRef={closeRef}
      content={
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
      }
    >
      <Button className="px-3" variant="primary">
        +
      </Button>
    </Modal>
  );
}
