import { useMemo } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { API } from "@/app/utils/paths";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

interface IYearlyChartData {
  months: string[];
  credits: number[];
  debits: number[];
  saldo: number[];
  isLoading: boolean;
}

const MONTH_NAMES = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export function useYearlyChartData(): IYearlyChartData {
  const { balance, acctid } = useBalance();

  const canFetch = acctid != null;
  const params = canFetch ? { acctid } : undefined;

  const { response } = useSWR<IResponse<TGetAccountResponse>>(
    canFetch ? API.TRANSACTIONS.GET_TRANSACTIONS : undefined,
    params,
  );

  const allSaldos = useMemo(() => balance?.data?.[0]?.saldos ?? [], [balance]);

  const transactions: TTransaction[] = useMemo(() => {
    const all = response?.data?.[0]?.extratos ?? [];
    if (all.length === 0) return [];

    const latestDate = all.reduce((max, t) => {
      const d = new Date(t.dtposted);
      return d > max ? d : max;
    }, new Date(0));

    const latestYear = latestDate.getFullYear();

    return all
      .filter((t) => new Date(t.dtposted).getFullYear() === latestYear)
      .sort((a, b) => new Date(a.dtposted).getTime() - new Date(b.dtposted).getTime());
  }, [response]);

  const previousBalance = useMemo(() => {
    if (allSaldos.length === 0 || transactions.length === 0) return 0;

    const firstDate = new Date(transactions[0].dtposted);
    const currentYear = firstDate.getFullYear();

    const prevMonth = 11;
    const prevYear = currentYear - 1;

    const prevEntry = allSaldos.find((s) => {
      const date = new Date(s.enddate);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    return prevEntry?.balance ?? 0;
  }, [allSaldos, transactions]);

  const { months, credits, debits, saldo } = useMemo(() => {
    const monthSet = new Set<number>();
    const creditsMap: Record<number, number> = {};
    const debitsMap: Record<number, number> = {};
    const saldoMap: Record<number, number> = {};
    let running = previousBalance;

    for (const t of transactions) {
      const month = new Date(t.dtposted).getMonth();
      monthSet.add(month);
      running += t.trnamt;

      if (t.trnamt > 0) creditsMap[month] = (creditsMap[month] || 0) + t.trnamt;
      if (t.trnamt < 0) debitsMap[month] = (debitsMap[month] || 0) + Math.abs(t.trnamt);
      saldoMap[month] = running;
    }

    const sortedMonths = Array.from(monthSet).sort((a, b) => a - b);

    return {
      months: sortedMonths.map((m) => MONTH_NAMES[m]),
      credits: sortedMonths.map((m) => creditsMap[m] ?? 0),
      debits: sortedMonths.map((m) => debitsMap[m] ?? 0),
      saldo: sortedMonths.map((m) => saldoMap[m] ?? 0),
    };
  }, [transactions, previousBalance]);

  const isLoading = !response && canFetch;

  return { months, credits, debits, saldo, isLoading };
}
