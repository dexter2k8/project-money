"use client";
import Sidebar, { ISidebarItemProps } from "@/components/Sidebar";
import { cx } from "class-variance-authority";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { SignOut } from "../services/fetchers/auth";
import Divisor from "@/components/Divisor";
import { LayoutDashboard, FileSpreadsheet, Settings } from "lucide-react";

const sidebarItems: ISidebarItemProps[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
  { label: "Analytics", path: "/analytics", icon: <FileSpreadsheet /> },
  { label: "Settings", path: "/settings", icon: <Settings /> },
];

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await SignOut();
    if (result) router.replace("/");
  };

  return (
    <div className="h-screen">
      <header className="flex items-center justify-between p-4 bg-yellow-100">
        <Link className="flex items-center gap-2 w-fit" href="/dashboard">
          <Image className="dark:invert" src="/money.svg" alt="money logo" width={40} height={40} />
          <h3 className="whitespace-nowrap">Project Money</h3>
        </Link>
        <div className="flex gap-4">
          <Divisor vertical />
          <Button variant="link" onClick={handleSignOut}>
            Logout
          </Button>
        </div>
      </header>
      <div
        className={cx(
          "flex h-full w-full overflow-hidden",
          "bg-linear-to-r from-neutral-200 to-indigo-200",
        )}
      >
        <Sidebar items={sidebarItems} />
        {children}
      </div>
    </div>
  );
}
