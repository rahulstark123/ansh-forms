export const DEFAULT_FORM_CATEGORIES = [
  "General",
  "Registration",
  "Feedback",
  "Lead Gen",
  "Operations",
] as const;

export function normalizeCategoryName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function parseFormCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [...DEFAULT_FORM_CATEGORIES];
  const cleaned = raw
    .map((item) => (typeof item === "string" ? normalizeCategoryName(item) : ""))
    .filter(Boolean);
  const unique: string[] = [];
  for (const cat of cleaned) {
    if (!unique.some((u) => u.toLowerCase() === cat.toLowerCase())) {
      unique.push(cat);
    }
  }
  return unique.length > 0 ? unique : [...DEFAULT_FORM_CATEGORIES];
}

export function validateCategoryList(categories: string[]): string[] {
  const parsed = parseFormCategories(categories);
  if (parsed.length === 0) {
    throw new Error("At least one category is required.");
  }
  return parsed;
}
