"use client";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import { exportCsv } from "../utils/exportCsv";
import type { TFlatBalanceResponse } from "@/app/api/balances/types";
import type { IResponse } from "@/app/api/types";

type TExportBalanceCsvButtonProps = {
  acctid: string;
  accountId: string;
};

export function ExportBalanceCsvButton({ acctid, accountId }: TExportBalanceCsvButtonProps) {
  const handleClick = useCallback(async () => {
    try {
      const params = new URLSearchParams({ flatten: "true", accountId });
      const response = await fetch(`${API.BALANCES.GET_BALANCES}?${params}`);

      if (!response.ok) {
        const json = await response.json().catch(() => ({}));
        throw new Error(json.error || "Erro ao buscar saldos");
      }

      const result: IResponse<TFlatBalanceResponse> = await response.json();
      const saldos = result.data ?? [];

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
      const message = error instanceof Error ? error.message : "Erro ao exportar saldos.";
      toast.error(message);
    }
  }, [acctid, accountId]);

  return (
    <Button variant="primary" onClick={handleClick} disabled={!accountId}>
      Exportar Saldos
    </Button>
  );
}
