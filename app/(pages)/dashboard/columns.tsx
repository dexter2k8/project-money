import { IGridColDef } from "@/components/Table";

interface IInvoice {
  date: string;
  document: string;
  description: string;
  value: string;
  balance: string;
}

export const columns: IGridColDef<IInvoice>[] = [
  {
    field: "date",
    headerName: "Data",
    renderFooter: () => "",
  },
  { field: "description", headerName: "Descrição" },
  { field: "document", headerName: "Documento" },
  { field: "value", headerName: "Valor", className: "text-right" },
  {
    field: "balance",
    headerName: "Saldo",
    className: "text-right",
    renderFooter: (rows) => "Saldo: $5600",
    // `$${rows.reduce((acc, r) => acc + Number(r.amount.replace("$", "")), 0)}`,
  },
];

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
