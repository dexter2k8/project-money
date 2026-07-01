"use client";
import { useAuth } from "@/app/providers/AuthProvider";
import Tabs from "@/components/Tabs";
import About from "./steps/About";
import EditProfile from "./steps/EditProfile";
import { ManageUsers } from "./steps/ManageUsers";
import type { ITabItemProps } from "@/components/Tabs";

export default function Settings() {
  const { selfUser } = useAuth();
  const isAdmin = selfUser?.role === "admin";

  const tabItems: ITabItemProps[] = [{ key: 0, label: "Edit profile", children: <EditProfile /> }];
  const aboutTabKey = isAdmin ? 2 : 1;
  if (isAdmin) tabItems.push({ key: 1, label: "Manage Users", children: <ManageUsers /> });
  tabItems.push({ key: aboutTabKey, label: "About", children: <About /> });

  return (
    <div className="flex h-full w-full max-w-300 mx-auto">
      <main className="w-full flex flex-col bg-white p-8 m-8 rounded-lg overflow-auto">
        <Tabs items={tabItems} minWidth="25rem" />
      </main>
    </div>
  );
}
