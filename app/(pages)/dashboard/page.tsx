import Table from "@/components/Table";
import { columns, data } from "./columns";
import SegmentedControl from "@/components/SegmentedControl";

export default function Dashboard() {
  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <h2 className="p-4 shrink-0">Dashboard Content</h2>
      <SegmentedControl
        items={[
          { key: 0, label: "JAN" },
          { key: 1, label: "FEV" },
          { key: 2, label: "MAR" },
          { key: 3, label: "ABR" },
          { key: 4, label: "MAI" },
          { key: 5, label: "JUN" },
          { key: 6, label: "JUL" },
          { key: 7, label: "AGO" },
          { key: 8, label: "SET" },
          { key: 9, label: "OUT" },
          { key: 10, label: "NOV" },
          { key: 11, label: "DEZ" },
        ]}
      />
      <div className="m-4 flex-1 min-h-0 overflow-auto">
        <Table columns={columns} rows={data} caption="Anterior: $100" />
      </div>
    </div>
  );
}
