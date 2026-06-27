import { isPublicFormPath } from "@/lib/public-routes";

/** Sidebar auto-collapses at this width and below */
export const SIDEBAR_AUTO_COLLAPSE_MAX_WIDTH = 1280;

/** Workspace UI is desktop-only below this width */
export const MOBILE_BLOCKED_MAX_WIDTH = 999;

/** Routes that must stay usable on mobile (no workspace mobile block) */
export function isMobileBlockExemptRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return true;

  if (pathname.startsWith("/adminpanel")) return true;

  if (pathname === "/") return true;
  if (pathname.startsWith("/p/") || pathname.startsWith("/f/")) return true;
  if (isPublicFormPath(pathname)) return true;

  return (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/onboarding"
  );
}
