import ColumnActions from "@/app/(pages)/settings/steps/ManageUsers/ColumnActions";
import Switch from "@/components/Switch";
import type { IActions } from "@/app/(pages)/settings/steps/ManageUsers/types";
import type { TGetAccountResponse } from "@/app/api/accounts/types";
import type { TGetBankResponse } from "@/app/api/banks/types";
import type { IGridColDef } from "@/components/Table";

interface IColumnsProps extends IActions {
  banks: TGetBankResponse[];
  hiddenAccounts: string[];
  setHiddenAccounts: (value: string[] | null) => void;
}

export function getColumns({ onAction, banks, hiddenAccounts, setHiddenAccounts }: IColumnsProps) {
  const bankMap = new Map(banks.map((b) => [Number(b.id), b]));

  const columns: IGridColDef<TGetAccountResponse>[] = [
    {
      field: "acctid",
      header: "ACCOUNT ID",
    },
    {
      field: "accttype",
      header: "TYPE",
    },
    {
      field: "bankid",
      header: "BANK ID",
      render: (value) => {
        const bank = bankMap.get(Number(value));
        return bank ? bank.id : String(value);
      },
    },
    {
      field: "bankid",
      header: "BANK",
      render: (value) => {
        const bank = bankMap.get(Number(value));
        return bank ? bank.name : String(value);
      },
    },
    {
      field: "branchid",
      header: "BRANCH",
    },
    {
      field: "description",
      header: "DESCRIPTION",
    },
    {
      field: "acctid",
      header: "HIDDEN",
      render: (value) => {
        const acctid = value as string;
        const isHidden = hiddenAccounts.includes(acctid);
        return (
          <Switch
            checked={isHidden}
            onChange={(checked) => {
              if (checked) {
                setHiddenAccounts([...hiddenAccounts, acctid]);
              } else {
                setHiddenAccounts(hiddenAccounts.filter((id) => id !== acctid));
              }
            }}
          />
        );
      },
    },
    {
      field: "id",
      header: "ACTIONS",
      render: (value) => <ColumnActions id={value as string} onAction={onAction} />,
    },
  ];

  return columns;
}
