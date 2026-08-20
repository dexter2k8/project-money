import { NextResponse } from "next/server";
import { API } from "@/app/utils/paths";
import type { TPatchBalanceArgs, TPostSingleBalanceArgs } from "@/app/api/balances/types";

async function PostBalances(acctid: string) {
  try {
    const response = await fetch(API.BALANCES.POST_BALANCES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acctid }),
    });
    return response.json();
  } catch (error) {
    console.error("Post balances error:", error);
    return NextResponse.json({ error: "Failed to update balances" }, { status: 500 });
  }
}

async function PostBalance(data: TPostSingleBalanceArgs) {
  try {
    const response = await fetch(API.BALANCES.POST_BALANCE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Create balance error:", error);
    return NextResponse.json({ error: "Failed to create balance" }, { status: 500 });
  }
}

async function PatchBalance(id: string, accountId: string, data: TPatchBalanceArgs) {
  try {
    const response = await fetch(API.BALANCES.PATCH_BALANCE + id + "?accountId=" + accountId, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return response.json();
  } catch (error) {
    console.error("Update balance error:", error);
    return NextResponse.json({ error: "Failed to update balance" }, { status: 500 });
  }
}

async function DeleteBalance(id: string, accountId: string) {
  try {
    const response = await fetch(API.BALANCES.DELETE_BALANCE + id + "?accountId=" + accountId, {
      method: "DELETE",
    });
    return response.json();
  } catch (error) {
    console.error("Delete balance error:", error);
    return NextResponse.json({ error: "Failed to delete balance" }, { status: 500 });
  }
}

export { PostBalances, PostBalance, PatchBalance, DeleteBalance };
