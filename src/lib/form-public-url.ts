/** Public submission path for a published form. */
export function getFormPublicPath(companySlug: string, formSlug: string): string {
  return `/${companySlug}/${formSlug}`;
}

/** Full public submission URL for a published form. */
export function getFormPublicUrl(
  companySlug: string,
  formSlug: string,
  origin?: string,
): string {
  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${getFormPublicPath(companySlug, formSlug)}`;
}
