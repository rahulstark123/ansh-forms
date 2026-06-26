/** URL-safe slug from arbitrary text. */
export function slugify(input: string): string {
  let slug = input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-");
  if (slug.startsWith("-")) slug = slug.slice(1);
  if (slug.endsWith("-")) slug = slug.slice(0, -1);
  return slug || "workspace";
}
