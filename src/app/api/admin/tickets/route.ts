import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const tickets = await db.supportTicket.findMany({
      where: status && status !== "All" ? { status } : undefined,
      orderBy: { updatedAt: "desc" },
      include: {
        replies: {
          orderBy: { createdAt: "asc" },
          take: 1,
        },
        _count: { select: { replies: true } },
      },
    });

    return NextResponse.json({ tickets });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load tickets.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
