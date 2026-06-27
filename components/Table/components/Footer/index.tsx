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
    <tfoot>
      <tr>
        <td colSpan={span}>{columns[firstIndex].renderFooter!(rows)}</td>
        {columns.slice(firstIndex + span).map((col, i) => (
          <td key={i}>{col.renderFooter ? col.renderFooter(rows) : ""}</td>
        ))}
      </tr>
    </tfoot>
  );
}
