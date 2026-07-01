import Image from "next/image";
import TableActions from "@/components/TableActions";
import type { IUser } from "@/app/api/auth/get-self-user/types";
import type { IGridColDef } from "@/components/Table";
import type { IActions } from "@/components/TableActions";

export function getColumns({ onAction }: IActions) {
  const columns: IGridColDef<IUser>[] = [
    {
      field: "displayName",
      header: "NAME",
    },
    {
      field: "email",
      header: "EMAIL",
    },
    {
      field: "photoURL",
      header: "AVATAR",
      render(value) {
        return (
          <>
            {value ? (
              <Image
                src={value as string}
                alt="avatar"
                width={28}
                height={28}
                style={{ borderRadius: "50%" }}
              />
            ) : (
              <p>N/A</p>
            )}
          </>
        );
      },
    },
    {
      field: "uid",
      header: "ACTIONS",
      render: (value) => <TableActions id={value as string} onAction={onAction} />,
    },
  ];

  return columns;
}
