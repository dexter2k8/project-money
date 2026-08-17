import { NextResponse } from "next/server";
import { API } from "@/app/utils/paths";
import type { TPatchAccountArgs,TPostAccountArgs } from "@/app/api/accounts/types";

async function PostAccount(data: TPostAccountArgs) {
  try {
    const response = await fetch(API.ACCOUNTS.POST_ACCOUNT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Create account error:", error);
    return NextResponse.json({ error: "Failed to create account" }, { status: 500 });
  }
}

async function PatchAccount(id: string, data: TPatchAccountArgs) {
  try {
    const response = await fetch(API.ACCOUNTS.PATCH_ACCOUNT + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Update account error:", error);
    return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
  }
}

async function DeleteAccount(id: string) {
  try {
    const response = await fetch(API.ACCOUNTS.DELETE_ACCOUNT + id, { method: "DELETE" });
    return response.json();
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

export { PostAccount, PatchAccount, DeleteAccount };
