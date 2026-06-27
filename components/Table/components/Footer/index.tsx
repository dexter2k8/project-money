import { cx } from "class-variance-authority";
import { IGridColDef } from "../..";

export interface IFooter<T> {
  rows: T[];
  columns: IGridColDef<T>[];
}
export default function TableFooter<T>({ rows, columns }: IFooter<T>) {
  const firstIndex = columns.findIndex((col) => col.renderFooter);
  if (firstIndex === -1) return null;

  let span = 1;
  for (let i = firstIndex + 1; i < columns.length && !columns[i].renderFooter; i++) {
    span++;
  }

  return (
    <tfoot className="font-semibold bg-neutral-100 sticky bottom-0">
      <tr>
        <td className={"p-2 whitespace-nowrap"} colSpan={span}>
          {columns[firstIndex].renderFooter!(rows)}
        </td>
        {columns.slice(firstIndex + span).map((col, i) => (
          <td className={cx("p-2 whitespace-nowrap", col.className)} key={i}>
            {col.renderFooter ? col.renderFooter(rows) : ""}
          </td>
        ))}
      </tr>
    </tfoot>
  );
}
