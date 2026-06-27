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
  caption?: string;
}

export default function Table<T>({ rows, columns, caption }: ITableProps<T>) {
  return (
    <table className="w-full text-sm border-separate border-spacing-0">
      <Head columns={columns} caption={caption} />
      <Body rows={rows} columns={columns} />
      <Footer rows={rows} columns={columns} />
    </table>
  );
}
