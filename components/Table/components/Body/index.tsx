import { cx } from "class-variance-authority";
import { IGridColDef } from "../..";

interface IBodyProps<T> {
  rows: T[];
  columns: IGridColDef<T>[];
}

export default function Body<T>({ rows, columns }: IBodyProps<T>) {
  return (
    <tbody>
      {rows.map((row, i) => (
        <tr className="hover:bg-neutral-100" key={i}>
          {columns.map((col, j) => (
            <td
              className={cx("p-2 whitespace-nowrap border-b border-neutral-200", col.className)}
              key={j}
            >
              {col.render ? col.render(row[col.field]) : String(row[col.field])}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
