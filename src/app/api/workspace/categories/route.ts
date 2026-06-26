import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAuthProfile } from "@/lib/api-auth";
import { parseFormCategories, validateCategoryList } from "@/lib/form-categories";

async function getWorkspaceCategories(wid: number) {
  const workspace = await db.workspace.findUnique({ where: { wid } });
  if (!workspace) {
    return parseFormCategories([]);
  }
  return parseFormCategories(workspace.formCategories);
}

export async function GET(req: Request) {
  try {
    const profile = await getAuthProfile(req);
    if (!profile) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const categories = await getWorkspaceCategories(profile.wid);
    return NextResponse.json({ categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load categories.";
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
    const categories = validateCategoryList(body.categories || []);

    await db.workspace.update({
      where: { wid: profile.wid },
      data: { formCategories: categories },
    });

    return NextResponse.json({ message: "Categories updated.", categories });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update categories.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
