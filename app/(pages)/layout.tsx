"use client";
import { FileSpreadsheet, LayoutDashboard, Settings } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { PAGE_CONTAINER } from "./constants";
import Header from "./Header";
import SidebarHead from "./SidebarHead";
import { AuthProvider } from "../providers/AuthProvider";
import type { ISidebarItemProps } from "@/components/Sidebar";

const sidebarItems: ISidebarItemProps[] = [
  { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboard /> },
  { label: "Analytics", path: "/analytics", icon: <FileSpreadsheet /> },
  { label: "Settings", path: "/settings", icon: <Settings /> },
];

export default function PagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <Header />
      <div className={PAGE_CONTAINER}>
        <Sidebar header={SidebarHead} items={sidebarItems} />
        {children}
      </div>
    </AuthProvider>
  );
}
