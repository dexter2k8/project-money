"use client";
import { useMemo, useRef, useState } from "react";
import { cx } from "class-variance-authority";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Select from "@/components/Select";
import { buttonWrapperVariants, TRANSITION } from "./constants";
import { useSWR } from "../hooks/useSWR";
import { useAuth } from "../providers/AuthProvider";
import { API } from "../utils/paths";
import type { TGetAccountResponse } from "../api/accounts/types";
import type { IResponse, TGetBankResponse } from "../api/types";

export default function SidebarHead(isCollapsed: boolean) {
  const { setBank } = useAuth();
  const [selectedBank, setSelectedBank] = useState<TGetBankResponse | null>(null);
  const [pendingBank, setPendingBank] = useState<TGetBankResponse | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  const { response: banks } = useSWR<IResponse<TGetBankResponse>>(API.BANKS.GET_BANKS);
  const { response: accounts } = useSWR<IResponse<TGetAccountResponse>>(API.ACCOUNTS.GET_ACCOUNTS);

  const bankOptions = useMemo(() => {
    const accountBankIds = new Set(
      accounts?.data.map((a) => a.bankid) ?? [],
    );
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
    setPendingBank(selectedBank);
    triggerRef.current?.click();
  };

  const handleApply = () => {
    setSelectedBank(pendingBank);
    setBank(pendingBank);
  };

  const modalContent = (
    <div className="p-4">
      <Select
        options={bankOptions}
        value={pendingBank?.id ?? ""}
        onChange={(id) => setPendingBank(banks?.data.find((b) => b.id === id) ?? null)}
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
