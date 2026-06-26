import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const DRAFT_FORM_ID = "draft";
export type CanvasBackground = "gradient" | "mesh" | "dots" | "aurora" | "silk" | "noir";

export function isUiOnlyMode(): boolean {
  return process.env.NEXT_PUBLIC_UI_ONLY === "true";
}

export function isDraftFormId(id: string): boolean {
  return id === DRAFT_FORM_ID;
}

function slugify(title: string): string {
  let slug = title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  if (slug.startsWith("-")) slug = slug.substring(1);
  if (slug.endsWith("-")) slug = slug.substring(0, slug.length - 1);
  return slug || "untitled-form";
}

export interface DraftFormInput {
  title: string;
  description?: string;
  category?: string;
  fields?: any[];
  landingPage?: Record<string, unknown>;
  settings?: {
    logoUrl?: string;
    brandColor?: string;
    coverUrl?: string;
    thankYouTitle?: string;
    thankYouMessage?: string;
    requiresApproval?: boolean;
    headerEnabled?: boolean;
    headerTitle?: string;
    headerSubtitle?: string;
    footerEnabled?: boolean;
    footerText?: string;
    canvasBackground?: CanvasBackground;
  };
}

interface DraftFormState {
  id: string;
  title: string;
  description: string;
  category?: string;
  isPublished: boolean;
  slug: string;
  views: number;
  fields: any[];
  steps: any[];
  landingPage: {
    enabled: boolean;
    heroTitle: string;
    heroSubtitle: string;
    faqs: { question: string; answer: string }[];
    contactEmail: string;
    contactPhone: string;
    [key: string]: unknown;
  };
  settings: {
    logoUrl?: string;
    brandColor?: string;
    coverUrl?: string;
    thankYouTitle?: string;
    thankYouMessage?: string;
    headerEnabled?: boolean;
    headerTitle?: string;
    headerSubtitle?: string;
    footerEnabled?: boolean;
    footerText?: string;
    canvasBackground?: CanvasBackground;
    [key: string]: unknown;
  };
}

export function buildDraftForm(input: DraftFormInput): DraftFormState {
  const { title, description = "", category = "General", fields, landingPage, settings } = input;

  return {
    id: DRAFT_FORM_ID,
    title,
    description,
    category,
    isPublished: false,
    slug: slugify(title),
    views: 0,
    fields: fields ?? [
      { id: "full_name", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
    ],
    steps: [],
    landingPage: {
      enabled: false,
      heroTitle: title,
      heroSubtitle: description || "Please fill in the form fields below.",
      faqs: [],
      contactEmail: "",
      contactPhone: "",
      ...landingPage,
    },
    settings: {
      brandColor: "emerald",
      thankYouTitle: "Thank You!",
      thankYouMessage: "Your submission has been recorded.",
      requiresApproval: false,
      headerEnabled: true,
      headerTitle: title,
      headerSubtitle: description || "Complete the form below.",
      footerEnabled: true,
      footerText: "Powered by ANSH Forms",
      canvasBackground: "gradient",
      ...settings,
    },
  };
}

export function openDraftPlayground(
  router: AppRouterInstance,
  setActiveForm: (form: any) => void,
  input: DraftFormInput
) {
  setActiveForm(buildDraftForm(input));
  router.push(`/forms/${DRAFT_FORM_ID}/edit`);
}

export function mockAiDraftFromPrompt(prompt: string) {
  const title = prompt.trim().slice(0, 48) || "AI Generated Form";
  return buildDraftForm({
    title,
    description: "Locally generated preview — connect the API to persist AI forms.",
    fields: [
      { id: "full_name", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
      { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true },
      { id: "details", type: "textarea", label: "Additional Details", placeholder: "Share any extra context...", required: false },
    ],
    settings: { brandColor: "emerald" },
  });
}
