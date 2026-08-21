"use client";
import BalanceDisplay from "@/components/BalanceDisplay";
import { AddTransactionButton } from "./components/AddTransactionButton";
import { DeleteMonthButton } from "./components/DeleteMonthButton";
import { EditTransactionButton } from "./components/EditTransactionButton";
import type { TTransaction } from "@/app/api/accounts/types";
import type { IGridColDef } from "@/components/Table";

export type TTransactionWithSaldo = TTransaction & { saldo: number };

type TColumnsArgs = {
  acctid: string;
  month: number;
  year: number;
  mutate: () => void;
  showControls: boolean;
};

export const columns = ({
  acctid,
  month,
  year,
  mutate,
  showControls,
}: TColumnsArgs): IGridColDef<TTransactionWithSaldo>[] => {
  const actionsColumn: IGridColDef<TTransactionWithSaldo> = {
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
  };

  const baseColumns: IGridColDef<TTransactionWithSaldo>[] = [
    {
      field: "dtposted",
      header: "Data",
      className: "text-left w-28",
      render: (value) => {
        if (!value) return "";
        const str = String(value);
        const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) return `${match[3]}/${match[2]}/${match[1]}`;
        const date = new Date(str);
        const day = String(date.getUTCDate()).padStart(2, "0");
        const m = String(date.getUTCMonth() + 1).padStart(2, "0");
        const y = date.getUTCFullYear();
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

  return showControls ? [actionsColumn, ...baseColumns] : baseColumns;
};
