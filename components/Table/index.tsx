import Body from "./components/Body";
import Footer from "./components/Footer";
import Head from "./components/Head";

export interface IGridColDef<T> {
  field: keyof T;
  headerName: string;
  renderHeader?: (value?: string) => React.ReactNode;
  render?: (value: T[keyof T]) => React.ReactNode;
  renderFooter?: (rows: T[]) => React.ReactNode;
}
export interface ITableProps<T> {
  columns: IGridColDef<T>[];
  rows: T[];
}

export default function Table<T>({ rows, columns }: ITableProps<T>) {
  return (
    <table>
      <caption>Table caption</caption>
      <Head columns={columns} />
      <Body rows={rows} columns={columns} />
      <Footer rows={rows} columns={columns} />
    </table>
  );
}
