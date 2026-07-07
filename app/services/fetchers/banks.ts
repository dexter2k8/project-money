import { NextResponse } from "next/server";
import { API } from "@/app/utils/paths";
import type { TPatchBankArgs, TPostBankArgs } from "@/app/api/banks/types";

async function PostBank(data: TPostBankArgs) {
  try {
    const response = await fetch(API.BANKS.POST_BANK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Create bank error:", error);
    return NextResponse.json({ error: "Failed to create bank" }, { status: 500 });
  }
}

async function PatchBank(id: string, data: TPatchBankArgs) {
  try {
    const response = await fetch(API.BANKS.PATCH_BANK + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Update bank error:", error);
    return NextResponse.json({ error: "Failed to update bank" }, { status: 500 });
  }
}

async function DeleteBank(id: string) {
  try {
    const response = await fetch(API.BANKS.DELETE_BANK + id, { method: "DELETE" });
    return response.json();
  } catch (error) {
    console.error("Delete bank error:", error);
    return NextResponse.json({ error: "Failed to delete bank" }, { status: 500 });
  }
}

export { PostBank, PatchBank, DeleteBank };
