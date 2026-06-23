export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="LAYOUT">
      <header className="HEADER">
        <h2 className="LOGO">LOGO</h2>
      </header>
      {children}
    </div>
  );
}
