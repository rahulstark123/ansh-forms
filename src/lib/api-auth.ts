import { db } from "@/lib/db";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@prisma/client";

/** Resolve the authenticated profile from the Bearer token. */
export async function getAuthProfile(req: Request): Promise<Profile | null> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return null;

  return db.profile.findUnique({ where: { id: user.id } });
}
