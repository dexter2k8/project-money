"use client";
import { useCallback } from "react";
import { toast } from "react-toastify";
import Button from "@/components/Button";
import { exportCsv } from "../utils/exportCsv";
import type { TBalance } from "@/app/api/accounts/types";

type TExportBalanceCsvButtonProps = {
  acctid: string;
  saldos: TBalance[];
};

export function ExportBalanceCsvButton({ acctid, saldos }: TExportBalanceCsvButtonProps) {
  const handleClick = useCallback(() => {
    try {
      exportCsv({
        header: "ID;BALANCE;ENDDATE",
        rows: saldos.map(
          (s) => `${s.id};${Number(s.balance).toFixed(2)};${s.enddate.split("T")[0]}`,
        ),
        filename: `saldos_${acctid}.csv`,
        emptyMessage: "Nenhum saldo para exportar.",
        successMessage: `${saldos.length} saldo(s) exportado(s) com sucesso!`,
      });
    } catch (error) {
      console.error("Export balance CSV error:", error);
      toast.error("Erro ao exportar saldos.");
    }
  }, [saldos, acctid]);

  return (
    <Button variant="primary" onClick={handleClick} disabled={!acctid}>
      Exportar Saldos
    </Button>
  );
}
