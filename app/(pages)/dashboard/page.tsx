import Table from "@/components/Table";
import { columns, data } from "./columns";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";

export default function Dashboard() {
  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <h2 className="p-4 shrink-0">Dashboard Content</h2>
      <div className="p-4 flex justify-between gap-4 whitespace-nowrap">
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
        <Select
          className="w-32!"
          options={[
            { value: "2014", label: "2014" },
            { value: "2015", label: "2015" },
            { value: "2016", label: "2016" },
            { value: "2017", label: "2017" },
            { value: "2018", label: "2018" },
            { value: "2019", label: "2019" },
            { value: "2020", label: "2020" },
            { value: "2021", label: "2021" },
            { value: "2022", label: "2022" },
            { value: "2023", label: "2023" },
            { value: "2024", label: "2024" },
            { value: "2025", label: "2025" },
            { value: "2026", label: "2026" },
          ]}
        />
      </div>
      <div className="m-4 flex-1 min-h-0 overflow-auto">
        <Table columns={columns} rows={data} caption="Anterior: $100" />
      </div>
    </div>
  );
}
