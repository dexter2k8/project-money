import { useMemo } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { API } from "@/app/utils/paths";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

interface IAllPeriodChartData {
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

export function useAllPeriodChartData(): IAllPeriodChartData {
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

    return [...all].sort(
      (a, b) => new Date(a.dtposted).getTime() - new Date(b.dtposted).getTime(),
    );
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

  const { months, credits, debits, saldo } = useMemo(() => {
    const monthMap = new Map<string, { credits: number; debits: number; saldo: number }>();
    let running = previousBalance;

    for (const t of transactions) {
      const d = new Date(t.dtposted);
      const key = `${d.getFullYear()}-${d.getMonth()}`;

      if (!monthMap.has(key)) {
        monthMap.set(key, { credits: 0, debits: 0, saldo: 0 });
      }

      const entry = monthMap.get(key)!;
      running += t.trnamt;

      if (t.trnamt > 0) entry.credits += t.trnamt;
      if (t.trnamt < 0) entry.debits += Math.abs(t.trnamt);
      entry.saldo = running;
    }

    const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => {
      const [aYear, aMonth] = a.split("-").map(Number);
      const [bYear, bMonth] = b.split("-").map(Number);
      return aYear === bYear ? aMonth - bMonth : aYear - bYear;
    });

    return {
      months: sortedKeys.map((key) => {
        const [year, month] = key.split("-").map(Number);
        return `${MONTH_NAMES[month]}/${year}`;
      }),
      credits: sortedKeys.map((key) => monthMap.get(key)!.credits),
      debits: sortedKeys.map((key) => monthMap.get(key)!.debits),
      saldo: sortedKeys.map((key) => monthMap.get(key)!.saldo),
    };
  }, [transactions, previousBalance]);

  const isLoading = !response && canFetch;

  return { months, credits, debits, saldo, isLoading };
}
