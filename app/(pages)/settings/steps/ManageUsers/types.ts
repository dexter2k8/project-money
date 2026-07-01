export type TAction = "add" | "edit" | "delete";

export interface IActions {
  onAction: ({ action, id }: IActionsProps) => void;
}

export interface IActionsProps {
  action: TAction;
  id?: string | number;
}
