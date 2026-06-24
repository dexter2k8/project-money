"use client";
import { useState } from "react";
import SidebarMenu from "./components/SidebarMenu";
import { sidebarVariants } from "./constants";
import Divisor from "../Divisor";
import SidebarItems from "./components/SidebarItems";

export interface ISidebarItemProps {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export interface ISidebarProps {
  items: ISidebarItemProps[];
}

export default function Sidebar({ items }: ISidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <nav className={sidebarVariants({ isCollapsed })}>
      <SidebarMenu isCollapsed={isCollapsed} onClick={() => setIsCollapsed(!isCollapsed)} />
      <div className="px-2 pb-4">
        <Divisor />
      </div>
      <SidebarItems items={items} />
    </nav>
  );
}
