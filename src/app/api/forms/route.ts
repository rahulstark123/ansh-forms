import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

async function getUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      // Check if profile exists in database
      let profile = await db.profile.findUnique({ where: { id: user.id } });
      if (!profile) {
        // Find default or first workspace
        const workspace = await db.workspace.findFirst();
        const wid = workspace ? workspace.wid : 1;
        
        // Auto-provision PostgreSQL Profile matching the Supabase User
        profile = await db.profile.create({
          data: {
            id: user.id,
            email: user.email || `${user.id}@anshapps.com`,
            password: "",
            name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
            wid: wid,
            hasCompletedOnboarding: true,
            pricingPlan: "Free Trial",
            trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          }
        });
      }
      return user.id;
    }
  }

  // Session fallback: Get first profile in DB
  const firstProfile = await db.profile.findFirst();
  return firstProfile?.id || "fallback-user-id";
}

export async function GET(req: Request) {
  try {
    const userId = await getUserId(req);
    
    const forms = await db.form.findMany({
      where: { profileId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    return NextResponse.json({ forms });
  } catch (error: any) {
    console.error("GET Forms error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch forms." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId(req);
    const body = await req.json();
    const { title, description, fields, landingPage, settings, category } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required." }, { status: 400 });
    }

    // Generate unique slug
    let slug = title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    if (slug.startsWith("-")) slug = slug.substring(1);
    if (slug.endsWith("-")) slug = slug.substring(0, slug.length - 1);
    slug = slug || "untitled-form";

    // Ensure uniqueness
    let exists = await db.form.findUnique({ where: { slug } });
    if (exists) {
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const form = await db.form.create({
      data: {
        title,
        description: description || "",
        category: category || "General",
        slug,
        fields: fields || [],
        landingPage: landingPage || {},
        settings: settings || {},
        profileId: userId
      }
    });

    return NextResponse.json({ message: "Form created successfully", form });
  } catch (error: any) {
    console.error("POST Form error:", error);
    return NextResponse.json({ error: error.message || "Failed to create form." }, { status: 500 });
  }
}
