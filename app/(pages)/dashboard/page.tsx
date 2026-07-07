"use client";
import { useMemo, useState } from "react";
import { useQueryState } from "nuqs";
import { useSWR } from "@/app/hooks/useSWR";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Table from "@/components/Table";
import { columns, data } from "./columns";
import type { TGetAccountResponse } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

const MONTH_ABBRS = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];

export default function Dashboard() {
  const [bankid] = useQueryState("bank");

  const { response: balancesResponse } = useSWR<IResponse<TGetAccountResponse>>(
    bankid ? API.BALANCES.GET_BALANCES : undefined,
    bankid ? { bankid } : undefined,
  );

  const saldos = useMemo(
    () => (balancesResponse?.data?.[0]?.saldos ?? []).slice(1),
    [balancesResponse],
  );

  const latest = saldos.length > 0 ? saldos[saldos.length - 1] : null;
  const latestDate = latest ? new Date(latest.enddate) : null;

  const [selectedYear, setSelectedYear] = useState<string | undefined>();
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>();

  const yearOptions = useMemo(() => {
    const years = [...new Set(saldos.map((s) => new Date(s.enddate).getFullYear()))];
    return years
      .sort((a, b) => b - a)
      .map((y) => ({ value: String(y), label: String(y) }));
  }, [saldos]);

  const monthItems = useMemo(() => {
    const months = [...new Set(saldos.map((s) => new Date(s.enddate).getMonth()))];
    return months
      .sort((a, b) => a - b)
      .map((m) => ({ key: m, label: MONTH_ABBRS[m] }));
  }, [saldos]);

  const effectiveYear = selectedYear ?? (latestDate ? String(latestDate.getFullYear()) : yearOptions[0]?.value);
  const effectiveMonth = selectedMonth ?? (latestDate ? latestDate.getMonth() : monthItems[0]?.key);

  const { response } = useSWR<IResponse<TGetAccountResponse>>(
    bankid && effectiveYear && effectiveMonth != null ? API.TRANSACTIONS.GET_TRANSACTIONS : undefined,
    bankid && effectiveYear && effectiveMonth != null
      ? { bankid, month: String(effectiveMonth + 1), year: effectiveYear }
      : undefined,
  );

  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2>Extrato Bancário</h2>
        <Button variant="primary">Exportar CSV</Button>
      </div>
      {yearOptions.length > 0 && (
        <div className="p-4 flex justify-between gap-4 whitespace-nowrap">
          <SegmentedControl items={monthItems} selected={effectiveMonth} onSelect={setSelectedMonth} />
          <Select value={effectiveYear} onChange={setSelectedYear} className="w-32!" options={yearOptions} />
        </div>
      )}
      <div className="relative m-4 flex-1 min-h-0">
        <Button className="absolute left-1 top-1 z-10" variant="primary">
          Importar OFC/OFX
        </Button>
        <div className="h-full overflow-auto">
          <div className="min-w-4xl">
            <Table columns={columns} rows={data} caption="Anterior: $100" />
          </div>
        </div>
      </div>
    </div>
  );
}
