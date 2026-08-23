"use client";
import { useEffect, useMemo, useState } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { parseDateUTC } from "@/app/utils/dates";
import { API } from "@/app/utils/paths";
import BalanceDisplay from "@/components/BalanceDisplay";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Switch from "@/components/Switch";
import Table from "@/components/Table";
import { columns as createColumns } from "./columns";
import { MONTH_ABBRS } from "./constants";
import { ExportBalanceCsvButton } from "./components/ExportBalanceCsvButton";
import { ExportTransactionsCsvButton } from "./components/ExportTransactionsCsvButton";
import { ImportOfxButton } from "./components/ImportOfxButton";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";
import type { TTransactionWithSaldo } from "./columns";

export default function Dashboard() {
  const { balance, accountId, acctid, isLoadingBalance } = useBalance();

  const allSaldos = useMemo(() => balance?.data?.[0]?.saldos ?? [], [balance]);
  const saldos = useMemo(() => allSaldos.slice(1), [allSaldos]);
  const saldosForDate = saldos.length > 0 ? saldos : allSaldos;

  const latest = useMemo(() => (saldosForDate.length > 0 ? saldosForDate[saldosForDate.length - 1] : null), [saldosForDate]);
  const latestDate = useMemo(() => (latest ? parseDateUTC(latest.enddate) : null), [latest]);

  const [selections, setSelections] = useState<Record<string, { year?: string; month?: number }>>(
    {},
  );

  const selectionKey = acctid ?? "";
  const currentSelection = selections[selectionKey];

  const yearOptions = useMemo(() => {
    const years = [...new Set(saldosForDate.map((s) => parseDateUTC(s.enddate).getUTCFullYear()))];
    return years.sort((a, b) => b - a).map((y) => ({ value: String(y), label: String(y) }));
  }, [saldosForDate]);

  const effectiveYear =
    yearOptions.some((y) => y.value === currentSelection?.year)
      ? currentSelection?.year
      : (latestDate ? String(latestDate.getFullYear()) : yearOptions[0]?.value);

  const monthItems = useMemo(() => {
    const filtered = effectiveYear
      ? saldosForDate.filter((s) => String(parseDateUTC(s.enddate).getUTCFullYear()) === effectiveYear)
      : saldosForDate;
    const months = [...new Set(filtered.map((s) => parseDateUTC(s.enddate).getUTCMonth()))];
    return months.sort((a, b) => a - b).map((m) => ({ key: m, label: MONTH_ABBRS[m] }));
  }, [saldosForDate, effectiveYear]);

  const effectiveMonth =
    monthItems.some((m) => m.key === currentSelection?.month)
      ? currentSelection?.month
      : (monthItems.length > 0 ? monthItems[monthItems.length - 1].key : undefined);

  const setYear = (year: string) => {
    setSelections((prev) => ({
      ...prev,
      [selectionKey]: { year, month: undefined },
    }));
  };

  const setMonth = (month: number) => {
    setSelections((prev) => ({
      ...prev,
      [selectionKey]: { ...prev[selectionKey], month },
    }));
  };

  const canFetchTransactions = accountId && effectiveYear && effectiveMonth != null;
  const transactionsParams = canFetchTransactions
    ? { accountId, month: String(effectiveMonth + 1), year: effectiveYear }
    : undefined;

  const {
    response: transactionsResponse,
    isLoading,
    mutate: mutateTransactions,
  } = useSWR<IResponse<TGetAccountResponse>>(
    canFetchTransactions ? API.TRANSACTIONS.GET_TRANSACTIONS : undefined,
    transactionsParams,
  );

  const transactions: TTransaction[] = useMemo(
    () => transactionsResponse?.data?.[0]?.extratos ?? [],
    [transactionsResponse],
  );

  const previousBalance = useMemo(() => {
    if (effectiveMonth == null || !effectiveYear) return 0;

    let prevMonth = effectiveMonth - 1;
    let prevYear = Number(effectiveYear);
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    const prevEntry = allSaldos.find((s) => {
      const date = parseDateUTC(s.enddate);
      return date.getUTCMonth() === prevMonth && date.getUTCFullYear() === prevYear;
    });

    return prevEntry?.balance ?? 0;
  }, [allSaldos, effectiveMonth, effectiveYear]);

  const currentBalance = useMemo(() => {
    if (effectiveMonth == null || !effectiveYear) return 0;

    const currentEntry = allSaldos.find((s) => {
      const date = parseDateUTC(s.enddate);
      return date.getUTCMonth() === effectiveMonth && date.getUTCFullYear() === Number(effectiveYear);
    });

    return currentEntry?.balance ?? 0;
  }, [allSaldos, effectiveMonth, effectiveYear]);

  const transactionsWithSaldo = useMemo(() => {
    return transactions.reduce<TTransactionWithSaldo[]>((acc, t) => {
      const prevSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : previousBalance;
      return [...acc, { ...t, saldo: prevSaldo + t.trnamt }];
    }, []);
  }, [transactions, previousBalance]);

  const [showControls, setShowControls] = useState(false);

  const columns = useMemo(
    () =>
      canFetchTransactions
        ? createColumns({
            acctid: acctid ?? "",
            accountId,
            month: effectiveMonth + 1,
            year: Number(effectiveYear),
            mutate: mutateTransactions,
            showControls,
          })
        : [],
    [canFetchTransactions, acctid, accountId, effectiveMonth, effectiveYear, mutateTransactions, showControls],
  );

  const caption = <BalanceDisplay value={previousBalance} prefix="Anterior:" />;

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    requestAnimationFrame(() => setHasMounted(true));
  }, []);

  const isInitialLoading = hasMounted && !!acctid && isLoadingBalance && !balance;

  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2>Extrato Bancário</h2>
        <div className="flex items-center gap-2">
          {hasMounted && accountId && <ExportTransactionsCsvButton accountId={accountId} />}
          {hasMounted && acctid && <ExportBalanceCsvButton acctid={acctid} saldos={allSaldos} />}
        </div>
      </div>
      {isInitialLoading ? (
        <div className="flex-1 flex items-center justify-center text-neutral-400">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-violet-600" />
            Carregando dados da conta...
          </div>
        </div>
      ) : (
        <>
          {yearOptions.length > 0 && (
            <div className="p-4 flex justify-between gap-4 whitespace-nowrap">
              <SegmentedControl items={monthItems} selected={effectiveMonth} onSelect={setMonth} />
              <Select
                value={effectiveYear}
                onChange={setYear}
                className="w-32!"
                options={yearOptions}
              />
            </div>
          )}
          <div className="relative m-4 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              {hasMounted && acctid && (
                <ImportOfxButton acctid={acctid} accountId={accountId ?? ""} />
              )}
              <Switch checked={showControls} onChange={setShowControls} label="Show controls" />
            </div>

            <div className="flex-1 min-h-0 overflow-auto">
              <div className="min-w-4xl">
                <Table
                  columns={columns}
                  rows={transactionsWithSaldo}
                  caption={caption}
                  footerFirst={<BalanceDisplay value={currentBalance} prefix="Saldo:" />}
                  loading={isLoading}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
