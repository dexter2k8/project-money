import { IGridColDef } from "../..";

export interface IHeadProps<T> {
  columns: IGridColDef<T>[];
}
export default function Head<T>({ columns }: IHeadProps<T>) {
  return (
    <thead>
      <tr>
        {columns.map((col, i) => (
          <th key={i}> {col.renderHeader ? col.renderHeader(col.headerName) : col.headerName}</th>
        ))}
      </tr>
    </thead>
  );
}
