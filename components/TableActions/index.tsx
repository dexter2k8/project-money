import { SquareMinus, SquarePen } from "lucide-react";
import { Tooltip } from "react-tooltip";

export type TAction = "add" | "edit" | "delete";

export interface IActions {
  onAction: ({ action, id }: IActionsProps) => void;
}

export interface IActionsProps {
  action: TAction;
  id?: string | number;
}

interface ITableActionsProps extends IActions {
  id: string | number;
}

export default function TableActions({ id, onAction }: ITableActionsProps) {
  return (
    <div className="flex gap-4 [&_svg]:cursor-pointer">
      <span
        data-tooltip-id="income-tooltip"
        data-tooltip-content="Edit"
        onClick={() => onAction({ action: "edit", id })}
      >
        <SquarePen size="1rem" />
      </span>
      <Tooltip id="income-tooltip" />
      <span
        data-tooltip-id="delete-tooltip"
        data-tooltip-content="Delete"
        onClick={() => onAction({ action: "delete", id })}
      >
        <SquareMinus className="text-red-500" size="1rem" />
      </span>
      <Tooltip id="delete-tooltip" />
    </div>
  );
}
