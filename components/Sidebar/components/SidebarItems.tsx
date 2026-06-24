import Link from "next/link";
import { ISidebarProps } from "..";
import { cx } from "class-variance-authority";
import { usePathname } from "next/navigation";

export default function SidebarItems({ items }: ISidebarProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-4">
      {items.map(({ label, path, icon }, i) => (
        <li key={i} className={cx(pathname === path ? "bg-violet-200" : "hover:bg-violet-100")}>
          <Link className="flex items-center" href={path}>
            <figure className="px-4.5">{icon}</figure>
            <h4>{label}</h4>
          </Link>
        </li>
      ))}
    </ul>
  );
}
