import { IGridColDef } from "../..";

interface IBodyProps<T> {
  rows: T[];
  columns: IGridColDef<T>[];
}

export default function Body<T>({ rows, columns }: IBodyProps<T>) {
  return (
    <tbody>
      {rows.map((row, i) => (
        <tr key={i}>
          {columns.map((col, j) => (
            <td key={j}>{col.render ? col.render(row[col.field]) : String(row[col.field])}</td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}
