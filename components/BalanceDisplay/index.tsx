interface IBalanceDisplayProps {
  value: number;
  prefix?: string;
}

export default function BalanceDisplay({ value, prefix }: IBalanceDisplayProps) {
  const formatted = Math.abs(value).toFixed(2).replace(".", ",");
  const suffix = value >= 0 ? "C" : "D";
  const color = value >= 0 ? "text-blue-600" : "text-red-600";

  return (
    <span>
      {prefix && <>{prefix} </>}
      <span className={color}>
        {formatted} {suffix}
      </span>
    </span>
  );
}
