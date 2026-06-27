"use client";
import { useState } from "react";
import SidebarArrow from "./components/SidebarArrow";
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
  header?: (isCollapsed: boolean) => React.ReactNode;
}

export default function Sidebar({ items, header }: ISidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  return (
    <nav className={sidebarVariants({ isCollapsed })}>
      <SidebarArrow isCollapsed={isCollapsed} onClick={() => setIsCollapsed(!isCollapsed)} />
      <div className="px-2 pb-4">
        <Divisor />
        {header?.(isCollapsed)}
        {!!header && <Divisor />}
      </div>
      <SidebarItems isCollapsed={isCollapsed} items={items} />
    </nav>
  );
}
