import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const form = await db.form.findUnique({
      where: { id },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    return NextResponse.json({ form });
  } catch (error: any) {
    console.error("GET Form ID error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, isPublished, slug, fields, landingPage, settings, steps, category } = body;

    // Check slug uniqueness if changed
    if (slug) {
      const existing = await db.form.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: "Slug URL is already taken." }, { status: 400 });
      }
    }

    const form = await db.form.update({
      where: { id },
      data: {
        title,
        description,
        category: category !== undefined ? category : undefined,
        isPublished,
        slug,
        fields: fields || [],
        steps: steps || [],
        landingPage: landingPage || {},
        settings: settings || {},
      },
    });

    return NextResponse.json({ message: "Form updated successfully", form });
  } catch (error: any) {
    console.error("PUT Form ID error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.form.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Form deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Form ID error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
