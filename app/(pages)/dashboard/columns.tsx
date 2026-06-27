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
  { invoice: "Invoice 5", status: "Paid", method: "Credit Card", amount: "$500" },
  { invoice: "Invoice 6", status: "Unpaid", method: "PayPal", amount: "$600" },
  { invoice: "Invoice 7", status: "Paid", method: "Credit Card", amount: "$700" },
  { invoice: "Invoice 8", status: "Unpaid", method: "PayPal", amount: "$800" },
  { invoice: "Invoice 9", status: "Paid", method: "Credit Card", amount: "$900" },
  { invoice: "Invoice 10", status: "Unpaid", method: "PayPal", amount: "$1000" },
];
