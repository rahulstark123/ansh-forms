import { NextResponse } from "next/server";

/** Resolve visitor country from edge/CDN headers (Vercel, Cloudflare). */
export async function GET(req: Request) {
  const country =
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("cf-ipcountry") ||
    "IN";

  const code = country.toUpperCase();
  return NextResponse.json({
    country: code,
    isIndia: code === "IN",
  });
}
