"use client";
import { useSWR } from "@/app/hooks/useSWR";
import { useAuth } from "@/app/providers/AuthProvider";
import { API } from "@/app/utils/paths";
import Button from "@/components/Button";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Table from "@/components/Table";
import { columns, data, segmentedControlItems, selectYearOptions } from "./columns";
import type { TGetAccountResponse } from "@/app/api/accounts/types";
import type { IResponse } from "@/app/api/types";

export default function Dashboard() {
  const { bank } = useAuth();
  const bankid = bank?.id;
  const { response } = useSWR<IResponse<TGetAccountResponse>>(
    bankid ? API.TRANSACTIONS.GET_TRANSACTIONS : undefined,
    bankid ? { bankid, month: "5", year: "2025" } : undefined,
  );
  console.log({ response, bankid });

  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <div className="flex items-center justify-between p-4">
        <h2>Extrato Bancário</h2>
        <Button variant="primary">Exportar CSV</Button>
      </div>
      <div className="p-4 flex justify-between gap-4 whitespace-nowrap">
        <SegmentedControl items={segmentedControlItems} />
        <Select defaultValue="2014" className="w-32!" options={selectYearOptions} />
      </div>
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
