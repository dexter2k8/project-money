import { cx } from "class-variance-authority";
import { switchThumbVariants, switchTrackVariants } from "./constants";

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
      className={cx(
        "flex items-center gap-2 select-none",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      )}
      onClick={() => !disabled && onChange(!checked)}
    >
      {label && <span className="text-sm text-neutral-700">{label}</span>}
      <span className={switchTrackVariants({ checked, disabled })}>
        <span className={switchThumbVariants({ checked })} />
      </span>
    </label>
  );
}
