import ColumnActions from "@/app/(pages)/settings/steps/ManageUsers/ColumnActions";
import type { IActions } from "@/app/(pages)/settings/steps/ManageUsers/types";
import type { TGetBanksResponse } from "@/app/api/types";
import type { IGridColDef } from "@/components/Table";

export function getColumns({ onAction }: IActions) {
  const columns: IGridColDef<TGetBanksResponse>[] = [
    {
      field: "id",
      header: "ID",
    },
    {
      field: "name",
      header: "NAME",
    },
    {
      field: "alias",
      header: "ALIAS",
    },
    {
      field: "id",
      header: "ACTIONS",
      render: (value) => <ColumnActions id={value as string} onAction={onAction} />,
    },
  ];

  return columns;
}
