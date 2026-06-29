"use client";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import Image from "next/image";
import { GetSelfUser } from "@/app/services/fetchers/auth";
import { ISelfUser } from "@/app/api/auth/get-self-user/types";

export default function SidebarFooter() {
  const [user, setUser] = useState<ISelfUser | null>(null);

  useEffect(() => {
    const getUserData = async () => {
      const user = await GetSelfUser();
      setUser(user);
    };

    getUserData();
  }, []);

  return (
    <div className="flex items-center py-4">
      <figure className="px-2.5">
        {user?.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName ?? "avatar"}
            width={40}
            height={40}
            className="rounded-full object-cover min-w-10 min-h-10"
          />
        ) : (
          <CircleUserRound className="w-10 h-10 text-neutral-400" />
        )}
      </figure>
      <section>
        <p className="font-semibold leading-3">{user?.displayName ?? "Usuário"}</p>
        <small className="text-neutral-500">{user?.email ?? "—"}</small>
      </section>
    </div>
  );
}
