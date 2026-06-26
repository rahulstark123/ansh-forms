import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/api-auth";
import { getProPricing, toRazorpayAmount } from "@/lib/pricing";
import { getRazorpayClient, getRazorpayKeyId } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to upgrade." }, { status: 401 });
    }

    if (profile.pricingPlan === "Pro") {
      return NextResponse.json({ error: "You are already on the Pro plan." }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const isIndia =
      typeof body.isIndia === "boolean"
        ? body.isIndia
        : (req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "IN").toUpperCase() === "IN";

    const pricing = getProPricing(isIndia);
    const razorpay = getRazorpayClient();

    const order = await razorpay.orders.create({
      amount: toRazorpayAmount(pricing.amount, pricing.currency),
      currency: pricing.currency,
      receipt: `pro_${profile.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        profileId: profile.id,
        plan: "Pro",
        region: isIndia ? "IN" : "INT",
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      displayAmount: pricing.display,
    });
  } catch (error: unknown) {
    console.error("Razorpay order error:", error);
    const message = error instanceof Error ? error.message : "Failed to create payment order.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
