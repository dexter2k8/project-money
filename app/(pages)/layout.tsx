import Sidebar from "@/components/Sidebar";
import { cx } from "class-variance-authority";
import Link from "next/link";
import Image from "next/image";

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen">
      <header className="bg-yellow-100">
        <Link className="flex items-center gap-2 w-fit" href="/dashboard">
          <Image className="dark:invert" src="/money.svg" alt="money logo" width={40} height={40} />
          <h3 className="whitespace-nowrap">Project Money</h3>
        </Link>
      </header>
      <div
        className={cx(
          "flex h-full w-full overflow-hidden",
          "bg-linear-to-r from-neutral-200 to-indigo-200",
        )}
      >
        <Sidebar />
        {children}
      </div>
    </div>
  );
}
