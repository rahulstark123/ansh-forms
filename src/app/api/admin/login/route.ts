import { NextResponse } from "next/server";
import {
  adminSessionCookieOptions,
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export async function POST(req: Request) {
  try {
    const { email, password, passcode, pin } = await req.json();

    if (!email || !password || !passcode || !pin) {
      return NextResponse.json(
        { error: "Email, password, passcode, and PIN are required." },
        { status: 400 }
      );
    }

    if (!verifyAdminCredentials(email, password, passcode, pin)) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    const token = createAdminSessionToken();
    const res = NextResponse.json({ message: "Logged in successfully." });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions());
    return res;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
