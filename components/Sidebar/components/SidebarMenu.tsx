import { cx } from "class-variance-authority";
import { ChevronRight } from "lucide-react";

interface IMenuProps {
  onClick: () => void;
  isCollapsed?: boolean;
}
export default function SidebarMenu({ onClick, isCollapsed }: IMenuProps) {
  return (
    <div className="flex items-end justify-between p-2">
      <p
        className={cx(
          isCollapsed ? "w-0 opacity-0" : "opacity-100",
          "whitespace-nowrap transition-all duration-300 ease-in-out",
        )}
      >
        Session: 01:00:00
      </p>
      <ChevronRight
        className="dark:invert cursor-pointer transition-all duration-300 ease-in-out"
        size={36}
        onClick={onClick}
        style={{ transform: `rotateY(${isCollapsed ? "0deg" : "180deg"})` }}
      />
    </div>
  );
}
