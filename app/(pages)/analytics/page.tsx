export default function Analytics() {
  return (
    <div className="m-8 bg-white w-full rounded-2xl overflow-hidden flex flex-col">
      <h2 className="p-4">Analytics Content</h2>
      <div className="p-4 grid grid-cols-2 auto-rows-fr gap-5 flex-1 min-h-0">
        <div className="p-2 border border-gray-200 col-span-1 row-span-2 rounded overflow-hidden">
          Chart 1
        </div>
        <div className="bg-orange-400 flex place-items-center col-span-1 row-span-2 rounded">
          Chart 2
        </div>
        <div className="bg-blue-300 col-span-2 row-span-3 rounded">Chart 3</div>
      </div>
    </div>
  );
}
