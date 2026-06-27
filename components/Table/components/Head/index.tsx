import { cx } from "class-variance-authority";
import { IGridColDef } from "../..";

export interface IHeadProps<T> {
  columns: IGridColDef<T>[];
  caption?: string;
}

export default function Head<T>({ columns, caption }: IHeadProps<T>) {
  return (
    <thead className="h-10 text-left border-b border-neutral-300 sticky top-0 bg-white">
      {caption && (
        <tr>
          <th className="px-2 whitespace-nowrap text-right font-semibold" colSpan={columns.length}>
            {caption}
          </th>
        </tr>
      )}

      <tr>
        {columns.map((col, i) => (
          <th className={cx("px-2 whitespace-nowrap", col.className)} key={i}>
            {col.renderHeader ? col.renderHeader(col.headerName) : col.headerName}
          </th>
        ))}
      </tr>
    </thead>
  );
}
