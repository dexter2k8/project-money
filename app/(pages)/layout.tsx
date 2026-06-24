"use client";
import Sidebar from "@/components/Sidebar";
import { cx } from "class-variance-authority";
import Link from "next/link";
import Image from "next/image";
import Button from "@/components/Button";
import { useRouter } from "next/navigation";
import { SignOut } from "../services/fetchers/auth";

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
        <Button variant="link" onClick={handleSignOut}>
          Logout
        </Button>
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
