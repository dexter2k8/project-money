"use client";

import { SignOut } from "@/app/services/fetchers/auth";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await SignOut();
    if (result) router.replace("/");
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <button onClick={handleSignOut}>Logout</button>
    </div>
  );
}
