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
      workspace: { 
        name: workspace.name, 
        slug, 
        wid: workspace.wid, 
        saathicode: workspace.saathicode,
        taxId: workspace.taxId || "",
        corporateEmail: workspace.corporateEmail || "",
        address: workspace.address || "",
        pincode: workspace.pincode || "",
        city: workspace.city || "",
        state: workspace.state || "",
        country: workspace.country || "",
        timezone: workspace.timezone || "Asia/Kolkata",
        language: workspace.language || "English (US)",
      },
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

    const { taxId, corporateEmail, address, pincode, city, state, country, timezone, language } = body;

    const workspace = await db.workspace.findUnique({ where: { wid: profile.wid } });
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    const slug = workspace.name.trim() === name ? (workspace.slug || await resolveUniqueWorkspaceSlug(name, profile.wid)) : await resolveUniqueWorkspaceSlug(name, profile.wid);

    const updated = await db.workspace.update({
      where: { wid: profile.wid },
      data: { 
        name, 
        slug,
        taxId: taxId !== undefined ? taxId : undefined,
        corporateEmail: corporateEmail !== undefined ? corporateEmail : undefined,
        address: address !== undefined ? address : undefined,
        pincode: pincode !== undefined ? pincode : undefined,
        city: city !== undefined ? city : undefined,
        state: state !== undefined ? state : undefined,
        country: country !== undefined ? country : undefined,
        timezone: timezone !== undefined ? timezone : undefined,
        language: language !== undefined ? language : undefined,
      },
    });

    return NextResponse.json({
      message: "Workspace updated.",
      workspace: { 
        name: updated.name, 
        slug: updated.slug, 
        wid: updated.wid,
        taxId: updated.taxId || "",
        corporateEmail: updated.corporateEmail || "",
        address: updated.address || "",
        pincode: updated.pincode || "",
        city: updated.city || "",
        state: updated.state || "",
        country: updated.country || "",
        timezone: updated.timezone || "Asia/Kolkata",
        language: updated.language || "English (US)",
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update workspace.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
