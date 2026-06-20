import { buttonVariants } from "./constants";

export type TButtonVariant = "default" | "default-reverse" | "primary" | "link" | "link-reverse";
export type TButtonSize = "sm" | "default" | "lg";

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TButtonVariant;
  size?: TButtonSize;
}

export default function Button({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: IButtonProps) {
  return (
    <button className={buttonVariants({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
