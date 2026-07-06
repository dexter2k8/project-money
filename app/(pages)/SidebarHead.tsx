"use client";
import { useMemo, useRef, useState } from "react";
import { cx } from "class-variance-authority";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Select from "@/components/Select";
import { buttonWrapperVariants, TRANSITION } from "./constants";
import { useSWR } from "../hooks/useSWR";
import { API } from "../utils/paths";
import type { IResponse, TPostBankArgs } from "../api/types";

export default function SidebarHead(isCollapsed: boolean) {
  const [selectedBankId, setSelectedBankId] = useState<string>("");
  const triggerRef = useRef<HTMLSpanElement>(null);

  const { response } = useSWR<IResponse<TPostBankArgs>>(API.BANKS.GET_BANKS);

  const bankOptions = useMemo(
    () =>
      response?.data.map((bank) => ({
        value: bank.id,
        label: bank.name,
      })) || [],
    [response],
  );

  const selectedBank = useMemo(
    () => response?.data.find((bank) => bank.id === selectedBankId),
    [response, selectedBankId],
  );

  const handleOpenModal = () => triggerRef.current?.click();

  const modalContent = (
    <div className="p-4">
      <Select
        options={bankOptions}
        value={selectedBankId}
        onChange={setSelectedBankId}
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

      <Modal title="Select Bank" content={modalContent} className="w-96" labelApply="Confirm">
        <span ref={triggerRef} className="hidden" />
      </Modal>
    </div>
  );
}
