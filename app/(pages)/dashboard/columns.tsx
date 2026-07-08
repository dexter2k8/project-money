import { SquarePen } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { TTransaction } from "@/app/api/accounts/types";
import type { IGridColDef } from "@/components/Table";

export const columns: IGridColDef<TTransaction>[] = [
  {
    field: "id",
    header: "",
    className: "text-center w-10",
    render: () => (
      <Modal cross title="Edit transaction" content={modalContent}>
        <Button>
          <SquarePen size={16} />
        </Button>
      </Modal>
    ),
    renderFooter: () => (
      <Modal cross title="Add transaction" content={modalContent}>
        <Button className="px-3" variant="primary">
          +
        </Button>
      </Modal>
    ),
  },
  {
    field: "dtposted",
    header: "Data",
    render: (value) => {
      if (!value) return "";
      const date = new Date(value);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    },
  },
  { field: "memo", className: "max-w-96 truncate", header: "Descrição" },
  { field: "chknum", header: "Documento" },
  {
    field: "trnamt",
    header: "Valor",
    className: "text-right",
    render: (value) => {
      const num = Number(value);
      const formatted = Math.abs(num).toFixed(2).replace(".", ",");
      const suffix = num >= 0 ? "C" : "D";
      const color = num >= 0 ? "text-blue-600" : "text-red-600";
      return (
        <span className={color}>
          {formatted} {suffix}
        </span>
      );
    },
  },
];

const modalContent = (
  <div className="flex flex-col gap-4 p-4 w-100">
    <Input type="date" label="Data" />
    <TextArea showCounter maxLength={100} label="Descrição" />
    <Input label="Documento" />
    <Input label="Valor" />
  </div>
);
