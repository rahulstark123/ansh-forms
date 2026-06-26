const RESERVED_FIRST_SEGMENTS = new Set([
  "dashboard",
  "forms",
  "analytics",
  "settings",
  "pricing",
  "onboarding",
  "landing-pages",
  "file-manager",
  "ai-builder",
  "templates",
  "support",
  "privacy",
  "terms",
  "login",
  "signup",
  "reset-password",
  "f",
  "p",
  "api",
]);

/** True for public form URLs: /{company}/{slug} and /{company}/{slug}/status (plus legacy /f/). */
export function isPublicFormPath(pathname: string): boolean {
  if (pathname.startsWith("/p/") || pathname.startsWith("/f/")) return true;

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length < 2 || segments.length > 3) return false;
  if (RESERVED_FIRST_SEGMENTS.has(segments[0])) return false;
  if (segments.length === 3 && segments[2] !== "status") return false;

  return true;
}
