import Table from "@/components/Table";
import { columns, data, segmentedControlItems, selectYearOptions } from "./columns";
import SegmentedControl from "@/components/SegmentedControl";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Modal from "@/components/Modal";

export default function Dashboard() {
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
        <Modal cross title="Importar OFC/OFX" subtitle="Selecione o arquivo" content={modalContent}>
          <Button className="absolute left-1 top-1 z-10" variant="primary">
            Importar OFC/OFX
          </Button>
        </Modal>
        <div className="h-full overflow-auto">
          <div className="min-w-4xl">
            <Table columns={columns} rows={data} caption="Anterior: $100" />
          </div>
        </div>
      </div>
    </div>
  );
}

const modalContent = (
  <div className="modal-content">
    <p className="modal-text">Este é um conteúdo de exemplo do modal.</p>
  </div>
);
