export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      <span className="bg-violet-400">SIDEBAR</span>
      <div className="w-full overflow-hidden">
        <header className="bg-yellow-100">
          <h1 className="LOGO">LOGO</h1>
        </header>
        {children}
      </div>
    </div>
  );
}
