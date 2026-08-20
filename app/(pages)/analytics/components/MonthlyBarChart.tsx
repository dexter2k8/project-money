import { useMonthlyChartData } from "@/app/hooks/useMonthlyChartData";
import ChartVerticalBar from "./ChartVerticalBar";

interface IMonthlyBarChartProps {
  title?: string;
}

export default function MonthlyBarChart({ title }: IMonthlyBarChartProps) {
  const { days, credits, debits, saldo, isLoading } = useMonthlyChartData();

  if (isLoading) {
    return (
      <div className="p-2 border border-neutral-200 w-full h-full flex items-center justify-center min-h-0 rounded">
        <span className="text-sm text-neutral-400">Carregando...</span>
      </div>
    );
  }

  return (
    <ChartVerticalBar
      title={title}
      days={days}
      credits={credits}
      debits={debits}
      saldo={saldo}
    />
  );
}
