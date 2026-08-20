import { useMemo } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { API } from "@/app/utils/paths";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

interface IMonthlyChartData {
  days: number[];
  credits: number[];
  debits: number[];
  saldo: number[];
  isLoading: boolean;
}

export function useMonthlyChartData(): IMonthlyChartData {
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
    const latestMonth = latestDate.getMonth();

    return all
      .filter((t) => {
        const d = new Date(t.dtposted);
        return d.getFullYear() === latestYear && d.getMonth() === latestMonth;
      })
      .sort((a, b) => new Date(a.dtposted).getTime() - new Date(b.dtposted).getTime());
  }, [response]);

  const previousBalance = useMemo(() => {
    if (allSaldos.length === 0 || transactions.length === 0) return 0;

    const firstDate = new Date(transactions[0].dtposted);
    let prevMonth = firstDate.getMonth() - 1;
    let prevYear = firstDate.getFullYear();
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    const prevEntry = allSaldos.find((s) => {
      const date = new Date(s.enddate);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    return prevEntry?.balance ?? 0;
  }, [allSaldos, transactions]);

  const { days, credits, debits, saldo } = useMemo(() => {
    const daySet = new Set<number>();
    const creditsMap: Record<number, number> = {};
    const debitsMap: Record<number, number> = {};
    const saldoMap: Record<number, number> = {};
    let running = previousBalance;

    for (const t of transactions) {
      const day = new Date(t.dtposted).getDate();
      daySet.add(day);
      running += t.trnamt;

      if (t.trnamt > 0) creditsMap[day] = (creditsMap[day] || 0) + t.trnamt;
      if (t.trnamt < 0) debitsMap[day] = (debitsMap[day] || 0) + Math.abs(t.trnamt);
      saldoMap[day] = running;
    }

    const sortedDays = Array.from(daySet).sort((a, b) => a - b);

    return {
      days: sortedDays,
      credits: sortedDays.map((d) => creditsMap[d] ?? 0),
      debits: sortedDays.map((d) => debitsMap[d] ?? 0),
      saldo: sortedDays.map((d) => saldoMap[d] ?? 0),
    };
  }, [transactions, previousBalance]);

  const isLoading = !response && canFetch;

  return { days, credits, debits, saldo, isLoading };
}
