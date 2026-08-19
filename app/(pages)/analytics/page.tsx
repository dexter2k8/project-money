"use client";
import { useMemo } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { API } from "@/app/utils/paths";
import ChartVerticalBar from "./components/ChartVerticalBar";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

export default function Analytics() {
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

  const { days, creditsByDay, debitsByDay, saldoByDay } = useMemo(() => {
    const daySet = new Set<number>();
    const credits: Record<number, number> = {};
    const debits: Record<number, number> = {};
    const saldo: Record<number, number> = {};
    let running = previousBalance;

    for (const t of transactions) {
      const day = new Date(t.dtposted).getDate();
      daySet.add(day);
      running += t.trnamt;

      if (t.trnamt > 0) credits[day] = (credits[day] || 0) + t.trnamt;
      if (t.trnamt < 0) debits[day] = (debits[day] || 0) + Math.abs(t.trnamt);
      saldo[day] = running;
    }

    const sortedDays = Array.from(daySet).sort((a, b) => a - b);

    return {
      days: sortedDays,
      creditsByDay: sortedDays.map((d) => credits[d] ?? 0),
      debitsByDay: sortedDays.map((d) => debits[d] ?? 0),
      saldoByDay: sortedDays.map((d) => saldo[d] ?? 0),
    };
  }, [transactions, previousBalance]);

  return (
    <div className="m-8 bg-white w-full rounded-2xl flex flex-col">
      <h2 className="p-4">Analytics Content</h2>
      <div className="p-4 grid grid-cols-2 auto-rows-fr gap-5 flex-1 min-h-0">
        <div className="col-span-1 row-span-2 rounded min-h-0">
          <ChartVerticalBar
            title="Análise mensal"
            days={days}
            credits={creditsByDay}
            debits={debitsByDay}
            saldo={saldoByDay}
          />
        </div>
        <div className="bg-orange-400 flex place-items-center col-span-1 row-span-2 rounded">
          Análise anual
        </div>
        <div className="bg-blue-300 col-span-2 row-span-3 rounded">Análise geral</div>
      </div>
    </div>
  );
}
