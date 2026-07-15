import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { resolveUniqueWorkspaceSlug } from "@/lib/workspace-slug";

export async function POST(request: Request) {
  try {
    const { email, id, name } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Please enter email." }, { status: 400 });
    }

    // Retrieve Profile
    let profile = await db.profile.findUnique({
      where: { email },
    });

    // If profile does not exist but id and name are supplied (e.g. Google Sign-In or initial sync)
    if (!profile && id && name) {
      // Find the next incremental WID
      const latestWorkspace = await db.workspace.findFirst({
        orderBy: { wid: "desc" },
      });
      const nextWid = latestWorkspace ? latestWorkspace.wid + 1 : 1;

      const workspaceName = `Workspace #${nextWid}`;
      const workspaceSlug = await resolveUniqueWorkspaceSlug(workspaceName);

      // Ensure Workspace exists
      await db.workspace.upsert({
        where: { wid: nextWid },
        update: {},
        create: {
          wid: nextWid,
          name: workspaceName,
          slug: workspaceSlug,
        },
      });

      // Create profile linked to workspace
      profile = await db.profile.create({
        data: {
          id,
          email,
          password: "",
          name,
          wid: nextWid,
          hasCompletedOnboarding: false,
          acceptedPolicies: true,
          policiesAcceptedAt: new Date(),
          pricingPlan: "Free Trial",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        },
      });
    }

    if (!profile) {
      return NextResponse.json({ error: "Profile not found in database." }, { status: 404 });
    }

    // Check if free trial or Pro plan has expired
    if ((profile.pricingPlan === "Free Trial" || profile.pricingPlan === "Pro") && profile.trialEndsAt && new Date() > new Date(profile.trialEndsAt)) {
      profile = await db.profile.update({
        where: { id: profile.id },
        data: { pricingPlan: "Free" },
      });
    }

    return NextResponse.json({
      message: "Login successful",
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
    console.error("Login API Error:", error);
    return NextResponse.json({ error: error.message || "Database error occurred during login." }, { status: 500 });
  }
}
