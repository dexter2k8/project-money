import Image from "next/image";

interface IMenuProps {
  onClick: () => void;
  isCollapsed?: boolean;
}
export default function Menu({ onClick, isCollapsed }: IMenuProps) {
  return (
    <Image
      onClick={onClick}
      className="dark:invert cursor-pointer transition-all duration-300 ease-in-out"
      src="/menu.svg"
      alt="money logo"
      width={32}
      height={32}
      priority
      style={{ transform: `rotateY(${isCollapsed ? "180deg" : "0deg"})` }}
    />
  );
}
