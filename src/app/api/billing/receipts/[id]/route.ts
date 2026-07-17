import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthProfile } from "@/lib/api-auth";
import fs from "fs";
import path from "path";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await params;

    const receipt = await db.receipt.findUnique({
      where: { id },
    });

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    // Scoping/authorization check: must belong to the logged-in user
    if (receipt.profileId !== profile.id) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    const fileUrl = receipt.fileUrl;
    let pdfBuffer: Buffer;

    if (fileUrl.startsWith("data:application/pdf;base64,")) {
      const base64Data = fileUrl.replace("data:application/pdf;base64,", "");
      pdfBuffer = Buffer.from(base64Data, "base64");
    } else if (fileUrl.startsWith("/") || !fileUrl.startsWith("http")) {
      const filePath = path.join(process.cwd(), "public", fileUrl);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Receipt file not found on local disk." }, { status: 404 });
      }
      pdfBuffer = fs.readFileSync(filePath);
    } else {
      const response = await fetch(fileUrl);
      if (!response.ok) {
        return NextResponse.json({ error: "Failed to download receipt from storage." }, { status: 500 });
      }
      pdfBuffer = Buffer.from(await response.arrayBuffer());
    }

    const filename = `${receipt.receiptNumber}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Download receipt error:", error);
    const message = error instanceof Error ? error.message : "Failed to download receipt.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
