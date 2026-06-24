"use client";
import { useState } from "react";
import Menu from "./components/menu";
import { sidebarVariants } from "./constants";

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  return (
    <nav className={sidebarVariants({ isCollapsed })}>
      <Menu onClick={() => setIsCollapsed(!isCollapsed)} />
    </nav>
  );
}
