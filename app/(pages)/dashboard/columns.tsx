import { SquarePen } from "lucide-react";
import { toast } from "react-toastify";
import { mutate as mutateSWR } from "swr";
import { DeleteTransactions } from "@/app/services/fetchers/transactions";
import { API } from "@/app/utils/paths";
import BalanceDisplay from "@/components/BalanceDisplay";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { TTransaction } from "@/app/api/accounts/types";
import type { IGridColDef } from "@/components/Table";

export type TTransactionWithSaldo = TTransaction & { saldo: number };

type TColumnsArgs = {
  acctid: string;
  month: number;
  year: number;
  mutate: () => void;
};

export const columns = ({ acctid, month, year, mutate }: TColumnsArgs): IGridColDef<TTransactionWithSaldo>[] => [
  {
    field: "id",
    header: "UID",
    className: "text-center w-10",
    renderHeader() {
      return (
        <Modal cross title="Add transaction" content={modalAdd(true)}>
          <Button className="px-3" variant="primary">
            +
          </Button>
        </Modal>
      );
    },
    render: () => (
      <Modal cross title="Edit transaction" content={modalAdd(false)}>
        <Button>
          <SquarePen size={16} />
        </Button>
      </Modal>
    ),
    renderFooter: () => (
      <Modal
        cross
        title="Delete month transactions"
        subtitle="Are you sure you want to delete all transactions for this month?"
        labelApply="Delete"
        onApply={async () => {
          try {
            await DeleteTransactions({ acctid, month, year });
            toast.success("Transações excluídas com sucesso!");
            mutate();
            mutateSWR(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
          } catch {
            toast.error("Erro ao excluir transações.");
          }
        }}
      >
        <Button className="px-3 bg-red-500!" variant="primary">
          -
        </Button>
      </Modal>
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

const modalAdd = (isAdd: boolean) => (
  <div className="flex flex-col gap-4 p-4 w-100">
    <div className="flex gap-4">
      <Input type="date" label="Data" />
      {!isAdd && (
        <Button className="px-3 bg-red-500!" variant="primary">
          -
        </Button>
      )}
    </div>
    <TextArea showCounter maxLength={100} label="Descrição" />
    <Input label="Documento" />
    <Input label="Valor" />
  </div>
);
