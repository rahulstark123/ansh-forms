import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { formId } = await req.json();
    if (!formId) {
      return NextResponse.json({ error: "Form ID is required." }, { status: 400 });
    }

    await db.form.update({
      where: { id: formId },
      data: {
        views: { increment: 1 }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Increment views error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
