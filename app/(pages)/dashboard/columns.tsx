import { IGridColDef } from "@/components/Table";

interface IInvoice {
  invoice: string;
  status: string;
  method: string;
  amount: string;
}

export const columns: IGridColDef<IInvoice>[] = [
  {
    field: "invoice",
    headerName: "Invoice",
    renderHeader: (value) => <b>{value}</b>,
    renderFooter: () => "Total",
  },
  { field: "status", headerName: "Status" },
  { field: "method", headerName: "Method" },
  {
    field: "amount",
    headerName: "Amount",
    renderFooter: (rows) =>
      `$${rows.reduce((acc, r) => acc + Number(r.amount.replace("$", "")), 0)}`,
  },
];

export const data: IInvoice[] = [
  { invoice: "Invoice 1", status: "Paid", method: "Credit Card", amount: "$100" },
  { invoice: "Invoice 2", status: "Unpaid", method: "PayPal", amount: "$200" },
  { invoice: "Invoice 3", status: "Paid", method: "Credit Card", amount: "$300" },
  { invoice: "Invoice 4", status: "Unpaid", method: "PayPal", amount: "$400" },
];
