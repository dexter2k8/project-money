import { ChevronRight } from "lucide-react";

interface IMenuProps {
  onClick: () => void;
  isCollapsed?: boolean;
}
export default function SidebarMenu({ onClick, isCollapsed }: IMenuProps) {
  return (
    <div className="flex p-2 justify-end">
      <ChevronRight
        className="dark:invert cursor-pointer transition-all duration-300 ease-in-out"
        size={36}
        onClick={onClick}
        style={{ transform: `rotateY(${isCollapsed ? "0deg" : "180deg"})` }}
      />
    </div>
  );
}
