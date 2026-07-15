import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveUniqueWorkspaceSlug } from "@/lib/workspace-slug";

export async function POST(request: Request) {
  try {
    const { id, email, name, acceptedPolicies, saathicode } = await request.json();

    if (!id || !email || !name) {
      return NextResponse.json({ error: "Missing required profile details." }, { status: 400 });
    }

    if (!acceptedPolicies) {
      return NextResponse.json({ error: "You must accept the Terms & Conditions and Privacy Policy." }, { status: 400 });
    }

    // Check if user already exists
    const existing = await db.profile.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({ error: "Email already registered in database." }, { status: 400 });
    }

    // Determine the next WID
    const latestWorkspace = await db.workspace.findFirst({
      orderBy: { wid: "desc" },
    });
    const nextWid = latestWorkspace ? latestWorkspace.wid + 1 : 1;

    const workspaceName = `${name}'s Workspace`;
    const workspaceSlug = await resolveUniqueWorkspaceSlug(workspaceName);

    // Ensure Workspace exists
    await db.workspace.upsert({
      where: { wid: nextWid },
      update: {
        saathicode: saathicode || null,
      },
      create: {
        wid: nextWid,
        name: workspaceName,
        slug: workspaceSlug,
        saathicode: saathicode || null,
      },
    });

    // Create the Profile record
    const profile = await db.profile.create({
      data: {
        id,
        email,
        password: "", // Handled by Supabase auth
        name,
        wid: nextWid,
        hasCompletedOnboarding: false,
        acceptedPolicies: true,
        policiesAcceptedAt: new Date(),
        pricingPlan: "Free Trial",
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    });

    return NextResponse.json({
      message: "Profile registered successfully",
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone,
        bio: profile.bio,
        accent: profile.accent,
        wid: profile.wid,
        pricingPlan: profile.pricingPlan,
        trialEndsAt: profile.trialEndsAt,
        hasCompletedOnboarding: profile.hasCompletedOnboarding,
      },
    });
  } catch (error: any) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ error: error.message || "Database error during signup sync." }, { status: 500 });
  }
}
