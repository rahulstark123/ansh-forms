import { NextResponse } from "next/server";
import { buildReceiptPdf } from "@/lib/receipt";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mockState = searchParams.get("state") || "Bihar";
    const mockCurrency = (searchParams.get("currency") || "INR").toUpperCase();
    const isINR = mockCurrency === "INR";

    const mockInput = {
      receiptNumber: "RCPT-2026-F9812A",
      invoiceNumber: "INV-2026-F9812A",
      issuedAt: new Date("2026-07-17T12:00:00Z"),
      customerName: "Acme Corporation Ltd.",
      customerState: mockState,
      ownerName: "Rahul Raj",
      ownerEmail: "rahul@acme.com",
      ownerPhone: "+91 98765 43210",
      description: "ANSH Forms Pro Plan Subscription",
      planLabel: "ANSH Forms Pro Plan",
      qty: 1,
      amountMinor: isINR ? 47100 : 500, // 471.00 INR (rounded 399 + 18% GST) or 5.00 USD
      currency: mockCurrency,
      gatewayOrderId: "order_Pv982J18aslkJ",
      gatewayPaymentId: "pay_Pv983Has872aA",
      periodStart: new Date("2026-07-17T12:00:00Z"),
      periodEnd: new Date("2026-08-16T12:00:00Z"),
    };

    const pdfBuffer = await buildReceiptPdf(mockInput);

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="receipt-sample.pdf"',
      },
    });
  } catch (error: unknown) {
    console.error("Preview receipt error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate preview.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
