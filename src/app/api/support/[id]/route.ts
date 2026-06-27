import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const email = new URL(req.url).searchParams.get("email");

    const ticket = await db.supportTicket.findUnique({
      where: { id },
      include: {
        replies: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    if (email && ticket.email.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { message, email } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const ticket = await db.supportTicket.findUnique({ where: { id } });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
    }

    if (ticket.email.toLowerCase() !== email.trim().toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    if (ticket.status === "Closed") {
      return NextResponse.json({ error: "This ticket is closed. You cannot send new messages." }, { status: 400 });
    }

    const nextStatus =
      ticket.status === "Resolved" || ticket.status === "Open"
        ? "Open"
        : "In Progress";

    const [reply, updatedTicket] = await db.$transaction([
      db.supportReply.create({
        data: {
          ticketDbId: id,
          message: message.trim(),
          isAdmin: false,
          authorEmail: ticket.email,
          authorName: ticket.name,
        },
      }),
      db.supportTicket.update({
        where: { id },
        data: { status: nextStatus },
      }),
    ]);

    return NextResponse.json({ reply, ticket: updatedTicket });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to send message.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
