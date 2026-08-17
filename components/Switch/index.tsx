import { cx } from "class-variance-authority";

export interface ISwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function Switch({ checked, onChange, label, disabled = false, className }: ISwitchProps) {
  return (
    <label
      className={cx("flex items-center gap-2 select-none", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer", className)}
      onClick={() => !disabled && onChange(!checked)}
    >
      {label && <span className="text-sm text-neutral-700">{label}</span>}
      <span
        className={cx(
          "relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out",
          checked ? "bg-violet-600" : "bg-neutral-300",
          disabled && "pointer-events-none",
        )}
      >
        <span
          className={cx(
            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
            checked ? "translate-x-4.5" : "translate-x-0.5",
            "mt-0.5",
          )}
        />
      </span>
    </label>
  );
}
