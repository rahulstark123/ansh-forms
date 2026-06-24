import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { id, email, name } = await request.json();

    if (!id || !email || !name) {
      return NextResponse.json({ error: "Missing required profile details." }, { status: 400 });
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

    // Ensure Workspace exists
    await db.workspace.upsert({
      where: { wid: nextWid },
      update: {},
      create: {
        wid: nextWid,
        name: `${name}'s Workspace`,
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
