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
  const [bankId, setBankId] = useLocalStorage<string | null>("bank", null);
  const [pendingBankId, setPendingBankId] = useState<string | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const { response: banks } = useSWR<IResponse<TGetBankResponse>>(API.BANKS.GET_BANKS);
  const { response: accounts } = useSWR<IResponse<TGetAccountResponse>>(API.ACCOUNTS.GET_ACCOUNTS);

  const selectedBank = useMemo(
    () => banks?.data.find((b) => b.id === bankId) ?? null,
    [banks, bankId],
  );

  const bankOptions = useMemo(() => {
    const accountBankIds = new Set(accounts?.data.map((a) => a.bankid) ?? []);
    return (
      banks?.data
        .filter((bank) => accountBankIds.has(Number(bank.id)))
        .map((bank) => ({
          value: bank.id,
          label: bank.name,
        })) ?? []
    );
  }, [banks, accounts]);

  const handleOpenModal = () => {
    setPendingBankId(bankId);
    triggerRef.current?.click();
  };

  const handleApply = () => {
    setBankId(pendingBankId);
  };

  const modalContent = (
    <div className="p-4">
      <Select
        options={bankOptions}
        value={pendingBankId ?? ""}
        onChange={(id) => setPendingBankId(id)}
        placeholder="Choose a bank"
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
          <small>CC: 123456 AG:1234</small>
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
