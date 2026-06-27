import Table from "@/components/Table";
import { columns, data } from "./columns";

export default function Dashboard() {
  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <h2 className="p-4 shrink-0">Dashboard Content</h2>
      <div className="flex-1 min-h-0 overflow-auto">
        <Table columns={columns} rows={data} />
      </div>
    </div>
  );
}
