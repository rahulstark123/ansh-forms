import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const [open, inProgress, resolved, closed, total] = await Promise.all([
      db.supportTicket.count({ where: { status: "Open" } }),
      db.supportTicket.count({ where: { status: "In Progress" } }),
      db.supportTicket.count({ where: { status: "Resolved" } }),
      db.supportTicket.count({ where: { status: "Closed" } }),
      db.supportTicket.count(),
    ]);

    return NextResponse.json({
      stats: { open, inProgress, resolved, closed, total },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load stats.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
