import { cx } from "class-variance-authority";
import Button from "@/components/Button";
import { buttonWrapperVariants, TRANSITION } from "./constants";

export default function SidebarHead(isCollapsed: boolean) {
  return (
    <div className="flex items-center">
      <div className={buttonWrapperVariants({ isCollapsed })}>
        <Button size="lg">IT</Button>
      </div>
      <div className={cx(isCollapsed && "opacity-0", "w-full", TRANSITION)}>
        <p>Itau</p>
        <div className="whitespace-nowrap flex items-center justify-between gap-2">
          <small>CC: 123456 AG:1234</small>
          <Button variant="link">Change</Button>
        </div>
      </div>
    </div>
  );
}
