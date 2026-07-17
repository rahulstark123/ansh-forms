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

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, saathicode } = await req.json();

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

    if (saathicode) {
      await db.workspace.update({
        where: { wid: profile.wid },
        data: { saathicode },
      });
    }

    // Determine the new subscription end date (trialEndsAt)
    let newTrialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    if (profile.pricingPlan === "Pro" && profile.trialEndsAt) {
      const currentEnd = new Date(profile.trialEndsAt);
      if (currentEnd > new Date()) {
        newTrialEndsAt = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    const updated = await db.profile.update({
      where: { id: profile.id },
      data: { 
        pricingPlan: "Pro",
        trialEndsAt: newTrialEndsAt,
      },
    });

    // Generate and save billing receipt/invoice
    try {
      const existingReceipt = await db.receipt.findUnique({
        where: { gatewayOrderId: razorpay_order_id },
      });

      if (!existingReceipt) {
        const { getRazorpayClient } = await import("@/lib/razorpay");
        const { buildReceiptPdf } = await import("@/lib/receipt");
        const { uploadFile } = await import("@/lib/r2");

        const razorpay = getRazorpayClient();
        const order = await razorpay.orders.fetch(razorpay_order_id);

        const currentYear = new Date().getFullYear();
        const uniqueSuffix = razorpay_payment_id.slice(-6).toUpperCase();
        const receiptNumber = `RCPT-${currentYear}-${uniqueSuffix}`;
        const invoiceNumber = `INV-${currentYear}-${uniqueSuffix}`;

        const periodStart = new Date();
        const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        const pdfBuffer = await buildReceiptPdf({
          receiptNumber,
          invoiceNumber,
          issuedAt: new Date(),
          customerName: profile.name || "Customer",
          customerState: profile.state,
          ownerName: profile.name,
          ownerEmail: profile.email,
          ownerPhone: profile.phone || "",
          description: "ANSH Forms Pro Plan Subscription",
          planLabel: "ANSH Forms Pro Plan",
          qty: 1,
          amountMinor: typeof order.amount === "number" ? order.amount : Math.round(Number(order.amount) * 100), // safety check
          currency: order.currency || "INR",
          gatewayOrderId: razorpay_order_id,
          gatewayPaymentId: razorpay_payment_id,
          periodStart,
          periodEnd,
        });

        const fileUrl = await uploadFile(`${receiptNumber}.pdf`, pdfBuffer, "application/pdf");

        await db.receipt.create({
          data: {
            receiptNumber,
            invoiceNumber,
            amountMinor: typeof order.amount === "number" ? order.amount : Math.round(Number(order.amount) * 100),
            currency: order.currency || "INR",
            fileUrl,
            gatewayOrderId: razorpay_order_id,
            gatewayPaymentId: razorpay_payment_id,
            profileId: profile.id,
            issuedAt: new Date(),
          },
        });
      }
    } catch (receiptError) {
      // Log receipt error but do not fail the billing response since user upgrade succeeded
      console.error("Failed to generate/save receipt PDF:", receiptError);
    }

    return NextResponse.json({
      message: "Payment verified. Welcome to Pro!",
      profile: {
        id: updated.id,
        pricingPlan: updated.pricingPlan,
        trialEndsAt: updated.trialEndsAt,
      },
    });
  } catch (error: unknown) {
    console.error("Razorpay verify error:", error);
    const message = error instanceof Error ? error.message : "Failed to verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
