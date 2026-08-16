"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { mutate } from "swr";
import { useSWR } from "@/app/hooks/useSWR";
import { useBalance } from "@/app/providers/BalanceProvider";
import { parseOfxFile } from "@/app/utils/parseOfx";
import { API } from "@/app/utils/paths";
import BalanceDisplay from "@/components/BalanceDisplay";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Table from "@/components/Table";
import { columns as createColumns } from "./columns";
import { MONTH_ABBRS } from "./constants";
import type { TGetAccountResponse, TTransaction } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";
import type { TTransactionWithSaldo } from "./columns";

export default function Dashboard() {
  const { balance, acctid, isLoadingBalance } = useBalance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const allSaldos = useMemo(() => balance?.data?.[0]?.saldos ?? [], [balance]);
  const saldos = useMemo(() => allSaldos.slice(1), [allSaldos]);

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
      const date = new Date(s.enddate);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    return prevEntry?.balance ?? 0;
  }, [allSaldos, effectiveMonth, effectiveYear]);

  const currentBalance = useMemo(() => {
    if (effectiveMonth == null || !effectiveYear) return 0;

    const currentEntry = allSaldos.find((s) => {
      const date = new Date(s.enddate);
      return date.getMonth() === effectiveMonth && date.getFullYear() === Number(effectiveYear);
    });

    return currentEntry?.balance ?? 0;
  }, [allSaldos, effectiveMonth, effectiveYear]);

  const transactionsWithSaldo = useMemo(() => {
    return transactions.reduce<TTransactionWithSaldo[]>((acc, t) => {
      const prevSaldo = acc.length > 0 ? acc[acc.length - 1].saldo : previousBalance;
      return [...acc, { ...t, saldo: prevSaldo + t.trnamt }];
    }, []);
  }, [transactions, previousBalance]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !acctid) return;

      setIsUploading(true);

      try {
        const buffer = await file.arrayBuffer();
        const decoder = new TextDecoder("iso-8859-1");
        const content = decoder.decode(buffer);
        const { transactions: parsed, accountInfo } = parseOfxFile(content);

        if (accountInfo.acctid && accountInfo.acctid !== acctid) {
          toast.error(
            `Arquivo é da conta ${accountInfo.acctid}, mas a conta selecionada é ${acctid}.`,
          );
          return;
        }

        if (parsed.length === 0) {
          toast.warning("Nenhuma transação encontrada no arquivo.");
          return;
        }

        const response = await fetch(API.TRANSACTIONS.POST_TRANSACTION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acctid, transactions: parsed }),
        });

        if (!response.ok) {
          throw new Error("Erro ao salvar transações");
        }

        const result = await response.json();

        if (result.count === 0) {
          toast.info("Todas as transações já existem no sistema.");
          return;
        }

        await fetch(API.BALANCES.POST_BALANCES, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acctid }),
        });

        toast.success(`${result.count} transação(ões) importada(s) com sucesso!`);
        mutateTransactions();
        mutate(`${API.BALANCES.GET_BALANCES}?acctid=${acctid}`);
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Erro ao importar arquivo. Verifique o formato.");
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [acctid, mutateTransactions],
  );

  const columns = useMemo(
    () =>
      canFetchTransactions
        ? createColumns({
            acctid,
            month: effectiveMonth + 1,
            year: Number(effectiveYear),
            mutate: mutateTransactions,
          })
        : [],
    [canFetchTransactions, acctid, effectiveMonth, effectiveYear, mutateTransactions],
  );

  const caption = <BalanceDisplay value={previousBalance} prefix="Anterior:" />;

  const isInitialLoading = !!acctid && isLoadingBalance && !balance;

  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2>Extrato Bancário</h2>
        <Button variant="primary">Exportar CSV</Button>
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
          <div className="relative m-4 flex-1 min-h-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".ofc,.ofx"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              className="absolute left-1 top-1 z-10"
              variant="primary"
              onClick={handleImportClick}
              disabled={isUploading}
            >
              {isUploading ? "Importando..." : "Importar OFC/OFX"}
            </Button>

            <div className="h-full overflow-auto">
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
