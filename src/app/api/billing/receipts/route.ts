import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthProfile } from "@/lib/api-auth";

export async function GET(req: Request) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const receipts = await db.receipt.findMany({
      where: { profileId: profile.id },
      orderBy: { issuedAt: "desc" },
    });

    return NextResponse.json({ receipts });
  } catch (error: unknown) {
    console.error("Fetch receipts error:", error);
    const message = error instanceof Error ? error.message : "Failed to load receipts.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
export const dynamic = "force-dynamic";
