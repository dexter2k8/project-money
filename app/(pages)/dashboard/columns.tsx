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
};

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
