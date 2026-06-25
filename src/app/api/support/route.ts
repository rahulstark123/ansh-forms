import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Generate a sequential ticket ID like TKT-00001
async function generateTicketId(): Promise<string> {
  const count = await db.supportTicket.count();
  const padded = String(count + 1).padStart(5, "0");
  return `TKT-${padded}`;
}

// GET /api/support — list all tickets (optionally filtered by email)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    const tickets = await db.supportTicket.findMany({
      where: email ? { email } : undefined,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    console.error("GET /api/support error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/support — create a new support ticket
export async function POST(req: Request) {
  try {
    const { name, email, subject, description, category, priority } = await req.json();

    if (!name || !email || !subject) {
      return NextResponse.json({ error: "Name, email, and subject are required." }, { status: 400 });
    }

    const ticketId = await generateTicketId();

    const ticket = await db.supportTicket.create({
      data: {
        ticketId,
        name,
        email,
        subject,
        description: description || "",
        category: category || "General",
        priority: priority || "Medium",
        status: "Open",
      },
    });

    return NextResponse.json({ message: "Ticket created successfully.", ticket });
  } catch (error: any) {
    console.error("POST /api/support error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
