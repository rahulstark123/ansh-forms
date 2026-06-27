import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminCredentials, isAdminAuthenticated } from "@/lib/admin-auth";

const ALLOWED_STATUSES = ["Open", "In Progress", "Resolved", "Closed"] as const;

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!status || !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const ticket = await db.supportTicket.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ ticket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const { id } = await params;
    const { message } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Reply message is required." }, { status: 400 });
    }

    const ticket = await db.supportTicket.findUnique({ where: { id } });
    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    const admin = getAdminCredentials();

    const [reply, updatedTicket] = await db.$transaction([
      db.supportReply.create({
        data: {
          ticketDbId: id,
          message: message.trim(),
          isAdmin: true,
          authorEmail: admin.email,
          authorName: "ANSH Support",
        },
      }),
      db.supportTicket.update({
        where: { id },
        data: {
          status: ticket.status === "Open" ? "In Progress" : ticket.status,
        },
      }),
    ]);

    return NextResponse.json({ reply, ticket: updatedTicket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send reply.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
