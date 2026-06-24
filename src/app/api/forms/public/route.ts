import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const form = await db.form.findUnique({
      where: { slug },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error("GET Public Form error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
