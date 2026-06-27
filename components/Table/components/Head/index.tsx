import { IGridColDef } from "../..";

export interface IHeadProps<T> {
  columns: IGridColDef<T>[];
}
export default function Head<T>({ columns }: IHeadProps<T>) {
  return (
    <thead className="h-10 text-left  border-b border-neutral-300">
      <tr>
        {columns.map((col, i) => (
          <th className="px-2 whitespace-nowrap" key={i}>
            {col.renderHeader ? col.renderHeader(col.headerName) : col.headerName}
          </th>
        ))}
      </tr>
    </thead>
  );
}
