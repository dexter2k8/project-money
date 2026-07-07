import { SquarePen } from "lucide-react";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import TextArea from "@/components/TextArea";
import type { IGridColDef } from "@/components/Table";

interface IInvoice {
  date: string;
  document: string;
  description: string;
  value: string;
  balance: string;
}

export const columns: IGridColDef<IInvoice>[] = [
  {
    field: "balance",
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
    field: "date",
    header: "Data",
  },
  { field: "description", header: "Descrição" },
  { field: "document", header: "Documento" },
  { field: "value", header: "Valor", className: "text-right" },
  {
    field: "balance",
    header: "Saldo",
    className: "text-right",
    renderFooter: () => "Saldo: $5600",
    // `$${rows.reduce((acc, r) => acc + Number(r.amount.replace("$", "")), 0)}`,
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

export const data: IInvoice[] = [
  { date: "Data 1", document: "Paid", description: "Credit Card", value: "$100", balance: "$200" },
  { date: "Data 2", document: "Unpaid", description: "PayPal", value: "$200", balance: "$300" },
  { date: "Data 3", document: "Paid", description: "Credit Card", value: "$300", balance: "$400" },
  { date: "Data 4", document: "Unpaid", description: "PayPal", value: "$400", balance: "$500" },
  { date: "Data 5", document: "Paid", description: "Credit Card", value: "$500", balance: "$600" },
  { date: "Data 6", document: "Unpaid", description: "PayPal", value: "$600", balance: "$700" },
  { date: "Data 7", document: "Paid", description: "Credit Card", value: "$700", balance: "$800" },
  { date: "Data 8", document: "Unpaid", description: "PayPal", value: "$800", balance: "$900" },
  { date: "Data 9", document: "Paid", description: "Credit Card", value: "$900", balance: "$1000" },
  { date: "Data 10", document: "Unpaid", description: "PayPal", value: "$1000", balance: "$1100" },
];
