"use client";

import MonthlyBarChart from "./components/MonthlyBarChart";
import YearlyBarChart from "./components/YearlyBarChart";

export default function Analytics() {
  return (
    <div className="m-8 bg-white w-full rounded-2xl flex flex-col">
      <h2 className="p-4">Analytics Content</h2>
      <div className="p-4 grid grid-cols-2 auto-rows-fr gap-5 flex-1 min-h-0">
        <div className="col-span-1 row-span-2 rounded min-h-0">
          <MonthlyBarChart title="Análise mensal" />
        </div>
        <div className="col-span-1 row-span-2 rounded min-h-0">
          <YearlyBarChart title="Análise anual" />
        </div>
        <div className="bg-blue-300 col-span-2 row-span-3 rounded">Análise geral</div>
      </div>
    </div>
  );
}
