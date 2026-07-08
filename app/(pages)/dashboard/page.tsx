"use client";
import { useMemo, useState } from "react";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Table from "@/components/Table";
import { columns } from "./columns";
import { MONTH_ABBRS } from "./constants";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

export default function Dashboard() {
  const { balance, acctid } = useBalance();

  const saldos = useMemo(() => (balance?.data?.[0]?.saldos ?? []).slice(1), [balance]);

  const latest = useMemo(() => (saldos.length > 0 ? saldos[saldos.length - 1] : null), [saldos]);
  const latestDate = useMemo(() => (latest ? new Date(latest.enddate) : null), [latest]);

  const [selections, setSelections] = useState<Record<string, { year?: string; month?: number }>>(
    {},
  );

  const selectionKey = acctid ?? "";
  const currentSelection = selections[selectionKey];

  const yearOptions = useMemo(() => {
    const years = [...new Set(saldos.map((s) => new Date(s.enddate).getFullYear()))];
    return years.sort((a, b) => b - a).map((y) => ({ value: String(y), label: String(y) }));
  }, [saldos]);

  const effectiveYear =
    currentSelection?.year ??
    (latestDate ? String(latestDate.getFullYear()) : yearOptions[0]?.value);

  const monthItems = useMemo(() => {
    const filtered = effectiveYear
      ? saldos.filter((s) => String(new Date(s.enddate).getFullYear()) === effectiveYear)
      : saldos;
    const months = [...new Set(filtered.map((s) => new Date(s.enddate).getMonth()))];
    return months.sort((a, b) => a - b).map((m) => ({ key: m, label: MONTH_ABBRS[m] }));
  }, [saldos, effectiveYear]);

  const effectiveMonth =
    currentSelection?.month ??
    (monthItems.length > 0 ? monthItems[monthItems.length - 1].key : undefined);

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

  const canFetchTransactions = acctid && effectiveYear && effectiveMonth != null;
  const transactionsParams = canFetchTransactions
    ? { acctid, month: String(effectiveMonth + 1), year: effectiveYear }
    : undefined;

  const { response: transactionsResponse } = useSWR<IResponse<TGetAccountResponse>>(
    canFetchTransactions ? API.TRANSACTIONS.GET_TRANSACTIONS : undefined,
    transactionsParams,
  );

  const transactions: TTransaction[] = useMemo(
    () => transactionsResponse?.data?.[0]?.extratos ?? [],
    [transactionsResponse],
  );

  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2>Extrato Bancário</h2>
        <Button variant="primary">Exportar CSV</Button>
      </div>
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
      <div className="relative m-4 flex-1 min-h-0">
        <Button className="absolute left-1 top-1 z-10" variant="primary">
          Importar OFC/OFX
        </Button>
        <div className="h-full overflow-auto">
          <div className="min-w-4xl">
            <Table columns={columns} rows={transactions} caption="Anterior: $100" />
          </div>
        </div>
      </div>
    </div>
  );
}
