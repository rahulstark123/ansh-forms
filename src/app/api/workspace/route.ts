import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthProfile } from "@/lib/api-auth";
import { resolveUniqueWorkspaceSlug } from "@/lib/workspace-slug";
import { ensureWorkspaceSlug } from "@/lib/workspace-slug";

export async function GET(req: Request) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const workspace = await db.workspace.findUnique({ where: { wid: profile.wid } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const slug = await ensureWorkspaceSlug(workspace);
    return NextResponse.json({
      workspace: { name: workspace.name, slug, wid: workspace.wid, saathicode: workspace.saathicode },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load workspace.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "Company name is required." }, { status: 400 });
    }

    const workspace = await db.workspace.findUnique({ where: { wid: profile.wid } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const slug = await resolveUniqueWorkspaceSlug(name, profile.wid);

    const updated = await db.workspace.update({
      where: { wid: profile.wid },
      data: { name, slug },
    });

    return NextResponse.json({
      message: "Workspace updated.",
      workspace: { name: updated.name, slug: updated.slug, wid: updated.wid },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update workspace.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
