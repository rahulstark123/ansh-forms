import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";

async function getUserId(req: Request): Promise<string> {
  const authHeader = req.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) return user.id;
  }

  // Session fallback: Get first profile in DB
  const firstProfile = await db.profile.findFirst();
  return firstProfile?.id || "fallback-user-id";
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserId(req);

    const profile = await db.profile.update({
      where: { id: userId },
      data: {
        pricingPlan: "Pro"
      }
    });

    return NextResponse.json({ message: "Workspace upgraded to PRO plan successfully", profile });
  } catch (error: any) {
    console.error("Upgrade API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
