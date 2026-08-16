"use client";
import { createContext, useCallback, useContext, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useSWR } from "../hooks/useSWR";
import { API } from "../utils/paths";
import type { PropsWithChildren } from "react";
import type { TGetAccountResponse } from "../api/accounts/types";
import type { TGetBankResponse } from "../api/banks/types";
import type { IResponse } from "../api/types";

interface IBalanceContextData {
  accounts: TGetAccountResponse[];
  banks: TGetBankResponse[];
  selectedAccount: TGetAccountResponse | null;
  selectedBank: TGetBankResponse | null;
  balance: IResponse<TGetAccountResponse> | undefined;
  acctid: string | null;
  setAcctid: (value: string | null) => void;
  isLoadingBanks: boolean;
  isLoadingAccounts: boolean;
  isLoadingBalance: boolean;
}

const BalanceContext = createContext<IBalanceContextData | null>(null);

export function BalanceProvider({ children }: PropsWithChildren) {
  const [acctid, setAcctid] = useLocalStorage<string | null>("account", null);

  const { response: allAccounts, isLoading: isLoadingAccounts } = useSWR<IResponse<TGetAccountResponse>>(
    API.BALANCES.GET_BALANCES,
  );

  const { response: banks, isLoading: isLoadingBanks } = useSWR<IResponse<TGetBankResponse>>(API.BANKS.GET_BANKS);

  const { response: balance, isLoading: isLoadingBalance } = useSWR<IResponse<TGetAccountResponse>>(
    acctid ? API.BALANCES.GET_BALANCES : undefined,
    acctid ? { acctid } : undefined,
  );

  const accounts = useMemo(() => allAccounts?.data ?? [], [allAccounts]);
  const bankList = useMemo(() => banks?.data ?? [], [banks]);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.acctid === acctid) ?? null,
    [accounts, acctid],
  );

  const selectedBank = useMemo(
    () => bankList.find((b) => Number(b.id) === selectedAccount?.bankid) ?? null,
    [bankList, selectedAccount],
  );

  const handleSetAcctid = useCallback(
    (value: string | null) => {
      setAcctid(value);
    },
    [setAcctid],
  );

  const values = useMemo(
    () => ({
      accounts,
      banks: bankList,
      selectedAccount,
      selectedBank,
      balance,
      acctid,
      setAcctid: handleSetAcctid,
      isLoadingBanks,
      isLoadingAccounts,
      isLoadingBalance,
    }),
    [accounts, bankList, selectedAccount, selectedBank, balance, acctid, handleSetAcctid, isLoadingBanks, isLoadingAccounts, isLoadingBalance],
  );

  return <BalanceContext.Provider value={values}>{children}</BalanceContext.Provider>;
}

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (!context) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};
