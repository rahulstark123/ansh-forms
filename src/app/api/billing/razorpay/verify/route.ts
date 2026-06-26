import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { getAuthProfile } from "@/lib/api-auth";

export async function POST(req: Request) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment response." }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Razorpay is not configured." }, { status: 500 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed." }, { status: 400 });
    }

    const updated = await db.profile.update({
      where: { id: profile.id },
      data: { pricingPlan: "Pro" },
    });

    return NextResponse.json({
      message: "Payment verified. Welcome to Pro!",
      profile: {
        id: updated.id,
        pricingPlan: updated.pricingPlan,
      },
    });
  } catch (error: unknown) {
    console.error("Razorpay verify error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
