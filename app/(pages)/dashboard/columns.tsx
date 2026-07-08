import { SquarePen } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { IGridColDef } from "@/components/Table";
import type { TTransaction } from "@/app/api/accounts/types";

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
  },
  { field: "memo", header: "Descrição" },
  { field: "chknum", header: "Documento" },
  {
    field: "trnamt",
    header: "Valor",
    className: "text-right",
    render: (value) => `$${Number(value).toFixed(2)}`,
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
