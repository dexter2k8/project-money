import { CircleUserRound } from "lucide-react";
// import Image from "next/image";

export default function SidebarFooter() {
  return (
    <div className="flex items-center py-4">
      <figure className="px-2.5">
        {/* <Image src={"globe.svg"} alt="avatar" width={40} height={40} /> */}
        <CircleUserRound className="w-10 h-10" />
      </figure>
      <section>
        <p className="font-semibold leading-3">User</p>
        <small>user@mail.com</small>
      </section>
    </div>
  );
}
