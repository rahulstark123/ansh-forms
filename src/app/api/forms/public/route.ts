import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureWorkspaceSlug } from "@/lib/workspace-slug";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const company = searchParams.get("company");

    if (!slug) {
      return NextResponse.json({ error: "Slug is required." }, { status: 400 });
    }

    const form = await db.form.findUnique({
      where: { slug },
      include: {
        profile: {
          include: { workspace: true },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    const workspaceSlug = await ensureWorkspaceSlug(form.profile.workspace);

    if (company && company !== workspaceSlug) {
      return NextResponse.json({ error: "Form not found." }, { status: 404 });
    }

    return NextResponse.json({ form, workspaceSlug });
  } catch (error: any) {
    console.error("GET Public Form error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
