import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getRazorpayClient } from "@/lib/razorpay";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    let transactions: {
      id: string;
      workspace: string;
      plan: string;
      amount: number;
      amountDisplay: string;
      currency: string;
      status: string;
      method: string;
      createdAt: string;
    }[] = [];

    try {
      const razorpay = getRazorpayClient();
      const result = await razorpay.payments.all({ count: 100 });
      const items = result.items ?? [];

      transactions = items
        .filter((p) => p.status === "captured" || p.status === "authorized")
        .map((p) => {
          const amount = typeof p.amount === "number" ? p.amount / 100 : 0;
          const currency = p.currency ?? "INR";
          const symbol = currency === "INR" ? "₹" : "$";
          const notes = (p.notes ?? {}) as Record<string, string>;
          return {
            id: p.id,
            workspace: notes.profileId ?? "—",
            plan: notes.plan ?? "Pro",
            amount,
            amountDisplay: `${symbol}${amount.toFixed(2)}`,
            currency,
            status: p.status ?? "unknown",
            method: p.method ?? "—",
            createdAt: new Date((p.created_at ?? Date.now() / 1000) * 1000).toISOString(),
          };
        });
    } catch {
      transactions = [];
    }

    return NextResponse.json({ transactions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load transactions.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
