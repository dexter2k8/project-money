import type { CSSProperties, ReactNode } from "react";

export interface IModalProps {
  isOpen: boolean;
  children: ReactNode;
  title?: string;
  subtitle?: string;
  cross?: boolean;
  width?: CSSProperties["width"];
  onClose?: () => void;
  onApply?: () => void | boolean | Promise<boolean | void>;
  loadingApply?: boolean;
  disabledApply?: boolean;
}

export interface IModalWrapperProps extends Omit<IModalProps, "isOpen"> {
  content?: ReactNode;
}
