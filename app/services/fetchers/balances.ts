import { NextResponse } from "next/server";
import { API } from "@/app/utils/paths";

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

export { PostBalances };
