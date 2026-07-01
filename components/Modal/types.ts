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
}

export interface IModalWrapperProps {
  children: ReactNode;
  content: ReactNode;
  title?: string;
  subtitle?: string;
  cross?: boolean;
  width?: CSSProperties["width"];
  onClose?: () => void;
  onApply?: () => void | boolean | Promise<boolean | void>;
}
