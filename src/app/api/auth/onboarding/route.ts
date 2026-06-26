import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import { FORM_TEMPLATES } from "@/config/templates";
import { resolveUniqueWorkspaceSlug } from "@/lib/workspace-slug";

async function getUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) return user.id;
  }

  // Fallback: Get first profile in DB
  const firstProfile = await db.profile.findFirst();
  return firstProfile?.id || "fallback-user-id";
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    const body = await req.json();
    const { phone, jobTitle, department, workspaceName, accent, firstFormTitle, firstFormTemplate } = body;

    // 1. Retrieve the profile to know the workspace ID
    const profile = await db.profile.findUnique({
      where: { id: userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    // 2. Update Profile details
    const updatedBio = `${jobTitle || "Member"} in ${department || "Product"}`;
    const updatedProfile = await db.profile.update({
      where: { id: userId },
      data: {
        phone: phone || "",
        bio: updatedBio,
        accent: accent || "emerald",
        hasCompletedOnboarding: true,
      },
    });

    // 3. Update Workspace Details
    if (workspaceName) {
      const workspaceSlug = await resolveUniqueWorkspaceSlug(workspaceName, profile.wid);
      await db.workspace.update({
        where: { wid: profile.wid },
        data: { name: workspaceName, slug: workspaceSlug },
      });
    }

    // 4. Create First Form if title supplied
    if (firstFormTitle) {
      // Find template configuration if template selected
      let templateFields: any[] = [
        { id: "full_name", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
        { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true }
      ];
      let templateLanding: any = {
        enabled: false,
        heroTitle: firstFormTitle,
        heroSubtitle: "Please fill in the form fields below.",
        faqs: [],
        contactEmail: profile.email || "",
        contactPhone: phone || ""
      };
      let templateSettings: any = {
        brandColor: accent || "emerald",
        thankYouTitle: "Thank You!",
        thankYouMessage: "Your submission has been recorded."
      };

      if (firstFormTemplate && firstFormTemplate !== "blank") {
        const found = FORM_TEMPLATES.find((t) => t.id === firstFormTemplate);
        if (found) {
          templateFields = found.fields;
          templateLanding = { ...found.landingPage, heroTitle: firstFormTitle };
          templateSettings = { ...found.settings, brandColor: accent || found.settings.brandColor };
        }
      }

      // Generate unique slug
      let slug = firstFormTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      if (slug.startsWith("-")) slug = slug.substring(1);
      if (slug.endsWith("-")) slug = slug.substring(0, slug.length - 1);
      slug = slug || "first-form";

      // Ensure uniqueness
      const exists = await db.form.findUnique({ where: { slug } });
      if (exists) {
        slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
      }

      await db.form.create({
        data: {
          title: firstFormTitle,
          description: "My first form created during onboarding setup.",
          slug,
          fields: templateFields,
          landingPage: templateLanding,
          settings: templateSettings,
          profileId: userId
        }
      });
    }

    return NextResponse.json({
      message: "Onboarding completed successfully",
      user: {
        id: updatedProfile.id,
        email: updatedProfile.email,
        name: updatedProfile.name,
        phone: updatedProfile.phone,
        bio: updatedProfile.bio,
        accent: updatedProfile.accent,
        wid: updatedProfile.wid,
        pricingPlan: updatedProfile.pricingPlan,
        trialEndsAt: updatedProfile.trialEndsAt,
        hasCompletedOnboarding: updatedProfile.hasCompletedOnboarding,
      }
    });
  } catch (error: any) {
    console.error("Onboarding API error:", error);
    return NextResponse.json({ error: error.message || "Failed to complete onboarding." }, { status: 500 });
  }
}
