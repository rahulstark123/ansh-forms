import crypto from "crypto";
import { cookies } from "next/headers";

export const ADMIN_SESSION_COOKIE = "ansh_admin_session";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "ansh-forms-admin-session-secret";
}

export function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "forms@anshapps.com",
    password: process.env.ADMIN_PASSWORD || "Rahul@123",
  };
}

export function verifyAdminCredentials(email: string, password: string) {
  const creds = getAdminCredentials();
  return email.trim().toLowerCase() === creds.email.toLowerCase() && password === creds.password;
}

export function createAdminSessionToken() {
  const payload = { exp: Date.now() + SESSION_TTL_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto.createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
  return `${data}.${sig}`;
}

export function verifyAdminSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [data, sig] = token.split(".");
  if (!data || !sig) return false;

  const expected = crypto.createHmac("sha256", getSessionSecret()).update(data).digest("base64url");
  if (sig !== expected) return false;

  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8")) as { exp?: number };
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export function adminSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}
