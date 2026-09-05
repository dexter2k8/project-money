interface IBalanceDisplayProps {
  value: number;
  prefix?: string;
}

export default function BalanceDisplay({ value, prefix }: IBalanceDisplayProps) {
  const formatted = Math.abs(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const isEffectivelyZero = Math.abs(value) < 0.005;
  const suffix = isEffectivelyZero || value >= 0 ? "C" : "D";
  const color = isEffectivelyZero || value >= 0 ? "text-blue-600" : "text-red-600";

  return (
    <span>
      {prefix && <>{prefix} </>}
      <span className={color}>
        {formatted} {suffix}
      </span>
    </span>
  );
}
