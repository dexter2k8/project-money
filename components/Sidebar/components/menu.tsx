import Image from "next/image";

interface IMenuProps {
  onClick: () => void;
}
export default function Menu({ onClick }: IMenuProps) {
  return (
    <Image
      onClick={onClick}
      className="dark:invert cursor-pointer"
      src="/menu.svg"
      alt="money logo"
      width={32}
      height={32}
      priority
    />
  );
}
