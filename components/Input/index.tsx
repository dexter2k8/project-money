import React from "react";
import Eye from "./Icons/eye";
import EyeSlashed from "./Icons/eye-slashed";
import InfoCircle from "./Icons/info-circle";
import CheckCircle from "./Icons/check-circle";
import ExclamationCircle from "./Icons/exclamation-circle";
import { iconVariants, inputVariants, labelVariants, messageVariants } from "./constants";

type TStatus = "info" | "success" | "error";
type size = "small" | "default" | "large";

interface IInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  status?: TStatus;
  message?: string;
  size?: size;
}

const messageIcon = (status: TStatus) => {
  const icon = {
    info: <InfoCircle />,
    success: <CheckCircle />,
    error: <ExclamationCircle />,
  };
  return icon[status];
};

const Input: React.FC<IInputProps> = ({
  label,
  status = "info",
  message,
  placeholder,
  type,
  size = "default",
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = type === "password";

  return (
    <div className="relative w-full">
      <input
        className={inputVariants({ size, disabled, isPassword, status })}
        placeholder={(label && " ") || placeholder}
        disabled={disabled}
        type={isPassword ? (showPassword ? "text" : "password") : type}
        {...props}
      />

      <label className={labelVariants({ size, disabled, status })}>{label}</label>

      {type === "password" && (
        <span
          className={iconVariants({ disabled })}
          onClick={() => !disabled && setShowPassword(!showPassword)}
        >
          {showPassword ? <Eye /> : <EyeSlashed />}
        </span>
      )}

      {message && (
        <p className={messageVariants({ status })}>
          {messageIcon(status)} {message}
        </p>
      )}
    </div>
  );
};

export default Input;
