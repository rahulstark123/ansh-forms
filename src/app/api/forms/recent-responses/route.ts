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

export async function GET(req: Request) {
  try {
    const userId = await getUserId(req);

    // Fetch submissions belonging to the user's forms
    const submissions = await db.submission.findMany({
      where: {
        form: {
          profileId: userId
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 6,
      include: {
        form: {
          select: {
            id: true,
            title: true,
            slug: true
          }
        }
      }
    });

    return NextResponse.json({ submissions });
  } catch (error: any) {
    console.error("GET Recent Responses error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch recent responses." }, { status: 500 });
  }
}
