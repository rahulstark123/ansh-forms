/** Matches signup/login trial length */
export const FREE_TRIAL_DAYS = 14;

/** Max active forms on Free plan (enforced in dashboard + forms pages) */
export const FREE_PLAN_FORM_LIMIT = 5;

export const FREE_PLAN_LIMIT = `Up to ${FREE_PLAN_FORM_LIMIT} forms per workspace`;

/** Included on Free plan */
export const FREE_PLAN_INCLUDED = [
  FREE_PLAN_LIMIT,
  "Unlimited responses per form",
  "Visual form builder with all field types",
  "Multi-step forms & section headers",
  "Public share links & QR codes",
  "Response analytics dashboard",
  "Ready-made templates library",
] as const;

/** Not included on Free — show with ✕ on Free card, ✓ on Pro */
export const FREE_PLAN_EXCLUDED = [
  "Unlimited forms per workspace",
  "Custom logo, colors & canvas backgrounds",
  "Optional landing page per form",
  "File upload, signature & consent fields",
  "CSV export of submissions",
  "Optional approval status tracking",
  "Media library for logos & attachments",
] as const;

/** Full Pro plan list */
export const PRO_PLAN_FEATURES = [
  "Unlimited forms per workspace",
  "Unlimited responses per form",
  "Visual form builder with all field types",
  "Multi-step forms & section headers",
  "Public workspace URLs, share links & QR codes",
  "Response analytics dashboard",
  "CSV export of submissions",
  "Ready-made templates library",
  "Custom logo, colors & canvas backgrounds",
  "Optional landing page per form",
  "File upload, signature & consent fields",
  "Optional approval status tracking",
  "Media library for logos & attachments",
] as const;

export const PRICING_COPY = {
  trialNote: `New workspaces get a ${FREE_TRIAL_DAYS}-day free trial with unlimited forms. No credit card required.`,
  freeDescription:
    "Core form building for small teams — upgrade to Pro for branding, exports, and more forms.",
  proDescription:
    "Full workspace with unlimited forms, branding, exports, and advanced field types.",
  sectionSubtitle:
    "Start free with essentials. Upgrade to Pro when you need the complete toolkit.",
} as const;
