import { create } from "zustand";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  bio: string;
  accent: string;
  wid: number;
  pricingPlan: string;
  trialEndsAt?: string;
  hasCompletedOnboarding?: boolean;
}

export interface GlobalAlert {
  id: string;
  code: "500" | "401" | "403" | "404" | "timeout" | "network-failed" | "offline" | "generic" | "success" | "info";
  message: string;
  timestamp: number;
}

interface FormField {
  id: string;
  type: string; // text, email, phone, number, textarea, dropdown, radio, checkbox, date, rating, file, signature
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // For choices like dropdown, radio, checkbox
}

interface FormLandingPage {
  enabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
  faqs: { question: string; answer: string }[];
  contactEmail: string;
  contactPhone: string;
}

interface FormSettings {
  logoUrl?: string;
  brandColor?: string; // emerald, amber, ocean, purple
  coverUrl?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  headerEnabled?: boolean;
  headerTitle?: string;
  headerSubtitle?: string;
  footerEnabled?: boolean;
  footerText?: string;
  canvasBackground?: "gradient" | "mesh" | "dots" | "aurora" | "silk" | "noir";
}

interface FormState {
  id: string;
  title: string;
  description: string;
  category?: string;
  isPublished: boolean;
  slug: string;
  views: number;
  fields: FormField[];
  steps: any[];
  landingPage: FormLandingPage;
  settings: FormSettings;
}

interface UIStore {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  
  user: UserProfile | null;
  setUser: (u: UserProfile | null) => void;
  
  isOffline: boolean;
  setIsOffline: (v: boolean) => void;

  globalAlerts: GlobalAlert[];
  addGlobalAlert: (code: GlobalAlert["code"], message: string) => void;
  removeGlobalAlert: (id: string) => void;

  activeForm: FormState | null;
  setActiveForm: (form: FormState | null) => void;
  updateActiveFormFields: (fields: FormField[]) => void;
  updateActiveFormLandingPage: (lp: Partial<FormLandingPage>) => void;
  updateActiveFormSettings: (settings: Partial<FormSettings>) => void;
  updateActiveFormSteps: (steps: any[]) => void;

  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: "dark", // Default to dark theme for ANSH suite
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(theme);
    }
  },
  sidebarCollapsed: false,
  setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
  
  user: null,
  setUser: (user) => set({ user }),

  isOffline: false, // Always start online — real offline/online events update this
  setIsOffline: (isOffline) => set({ isOffline }),

  globalAlerts: [],
  addGlobalAlert: (code, message) => set((state) => {
    // Avoid spamming duplicate alerts of same error type within 3 seconds
    const now = Date.now();
    const duplicate = state.globalAlerts.find(a => a.code === code && now - a.timestamp < 3000);
    if (duplicate) return {};

    const newAlert: GlobalAlert = {
      id: Math.random().toString(36).substring(2, 9),
      code,
      message,
      timestamp: now,
    };
    return { globalAlerts: [...state.globalAlerts, newAlert] };
  }),
  removeGlobalAlert: (id) => set((state) => ({
    globalAlerts: state.globalAlerts.filter((a) => a.id !== id),
  })),
  
  searchOpen: false,
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  
  activeForm: null,
  setActiveForm: (activeForm) => set({ activeForm }),
  updateActiveFormFields: (fields) =>
    set((state) => ({
      activeForm: state.activeForm ? { ...state.activeForm, fields } : null,
    })),
  updateActiveFormLandingPage: (lp) =>
    set((state) => ({
      activeForm: state.activeForm
        ? {
            ...state.activeForm,
            landingPage: { ...state.activeForm.landingPage, ...lp },
          }
        : null,
    })),
  updateActiveFormSettings: (settings) =>
    set((state) => ({
      activeForm: state.activeForm
        ? {
            ...state.activeForm,
            settings: { ...state.activeForm.settings, ...settings },
          }
        : null,
    })),
  updateActiveFormSteps: (steps) =>
    set((state) => ({
      activeForm: state.activeForm ? { ...state.activeForm, steps } : null,
    })),
}));
