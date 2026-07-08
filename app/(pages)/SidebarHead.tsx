"use client";
import { useMemo, useRef, useState } from "react";
import { cx } from "class-variance-authority";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Select from "@/components/Select";
import { buttonWrapperVariants, TRANSITION } from "./constants";
import { useSWR } from "../hooks/useSWR";
import { API } from "../utils/paths";
import type { TGetAccountResponse } from "../api/accounts/types";
import type { TGetBankResponse } from "../api/banks/types";
import type { IResponse } from "../api/types";

export default function SidebarHead(isCollapsed: boolean) {
  const [acctId, setAcctId] = useLocalStorage<string | null>("account", null);
  const [pendingAcctId, setPendingAcctId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const { response: banks } = useSWR<IResponse<TGetBankResponse>>(API.BANKS.GET_BANKS);
  const { response: accounts } = useSWR<IResponse<TGetAccountResponse>>(API.ACCOUNTS.GET_ACCOUNTS);

  const selectedAccount = useMemo(
    () => accounts?.data?.find((a) => a.acctid === acctId) ?? null,
    [accounts, acctId],
  );
  const selectedBank = useMemo(
    () => banks?.data?.find((b) => Number(b.id) === selectedAccount?.bankid) ?? null,
    [banks, selectedAccount],
  );

  const accountOptions = useMemo(() => {
    const bankMap = new Map(banks?.data?.map((b) => [Number(b.id), b]) ?? []);
    return (
      accounts?.data?.map((account) => {
        const bank = bankMap.get(account.bankid);
        return {
          value: account.acctid,
          label: `${account.acctid} - ${bank?.name ?? "Unknown"}`,
        };
      }) ?? []
    );
  }, [banks, accounts]);

  const handleOpenModal = () => {
    setPendingAcctId(acctId);
    triggerRef.current?.click();
  };

  const handleApply = () => {
    setAcctId(pendingAcctId);
  };

  const modalContent = (
    <div className="p-4">
      <Select
        options={accountOptions}
        value={pendingAcctId ?? ""}
        onChange={(id) => setPendingAcctId(id)}
        placeholder="Choose an account"
      />
    </div>
  );

  return (
    <div className="flex items-center">
      <div className={buttonWrapperVariants({ isCollapsed })}>
        <Button className="max-w-10" size="lg" onClick={handleOpenModal}>
          {selectedBank?.alias?.slice(0, 2).toUpperCase() || "??"}
        </Button>
      </div>
      <div className={cx(isCollapsed && "opacity-0", "w-full", TRANSITION)}>
        <p className="truncate">{selectedBank?.name || "Select a bank"}</p>
        <div className="whitespace-nowrap flex items-center justify-between gap-2">
          <small>{selectedAccount ? `CC: ${selectedAccount.acctid} AG: ${selectedAccount.branchid}` : "CC: ---- AG: ----"}</small>
          <Button variant="link" onClick={handleOpenModal}>
            Change
          </Button>
        </div>
      </div>

      <Modal
        title="Select Bank"
        content={modalContent}
        className="w-96"
        labelApply="Confirm"
        onApply={handleApply}
      >
        <span ref={triggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
