/** Public submission URL for a published form slug. */
export function getFormPublicUrl(slug: string, origin?: string) {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/f/${slug}`;
}
