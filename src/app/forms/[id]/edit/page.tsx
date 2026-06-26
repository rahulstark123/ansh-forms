"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import {
  Type, Mail, Phone, Hash, AlignLeft, ChevronDown, CheckSquare, Radio, Calendar, Star,
  Upload, PenTool, Plus, Trash2, ArrowUp, ArrowDown, Settings, Palette, Layers,
  Check, Copy, Eye, Save, Sparkles, FileText, Clock, ArrowLeft, X, AlertTriangle,
  BarChart2, ListOrdered, QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";
import { buildDraftForm, isDraftFormId, isUiOnlyMode } from "@/lib/draft-form";
import { getFormPublicUrl } from "@/lib/form-public-url";
import { FormQrModal } from "@/components/forms/form-qr-modal";
import ResponsesPage from "../responses/page";

const FIELD_TYPES = [
  { type: "text", label: "Short Text", icon: Type },
  { type: "email", label: "Email Address", icon: Mail },
  { type: "phone", label: "Phone Number", icon: Phone },
  { type: "number", label: "Number Input", icon: Hash },
  { type: "textarea", label: "Paragraph Text", icon: AlignLeft },
  { type: "dropdown", label: "Select Dropdown", icon: ChevronDown, hasOptions: true },
  { type: "radio", label: "Radio Buttons", icon: Radio, hasOptions: true },
  { type: "checkbox", label: "Checkbox List", icon: CheckSquare, hasOptions: true },
  { type: "date", label: "Date Picker", icon: Calendar },
  { type: "time", label: "Time Picker", icon: Clock },
  { type: "rating", label: "Star Rating", icon: Star },
  { type: "file", label: "File Upload", icon: Upload },
  { type: "signature", label: "E-Signature", icon: PenTool }
];

const DESIGN_BACKGROUNDS = [
  { id: "gradient", label: "Soft Gradient" },
  { id: "mesh", label: "Mesh Glow" },
  { id: "dots", label: "Dot Grid" },
  { id: "aurora", label: "Aurora" },
  { id: "silk", label: "Silk Waves" },
  { id: "noir", label: "Noir Texture" },
] as const;

export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  // Zustand Store
  const activeForm = useUIStore((state) => state.activeForm);
  const setActiveForm = useUIStore((state) => state.setActiveForm);
  const updateFields = useUIStore((state) => state.updateActiveFormFields);
  const updateLandingPage = useUIStore((state) => state.updateActiveFormLandingPage);
  const updateSettings = useUIStore((state) => state.updateActiveFormSettings);

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [activeTopTab, setActiveTopTab] = useState<"builder" | "responses">("builder");
  const [activeLeftTab, setActiveLeftTab] = useState<"general" | "branding" | "design" | "landing">("general");
  const [formSettingsOpen, setFormSettingsOpen] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedCanvasSection, setSelectedCanvasSection] = useState<"header" | "footer" | "background" | null>(null);

  // New FAQ inputs
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");

  // New Option input
  const [newOptionTexts, setNewOptionTexts] = useState<Record<string, string>>({});
  const [copiedLink, setCopiedLink] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  useEffect(() => {
    fetchFormDetails();
  }, [formId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty || isDraftFormId(formId)) {
        e.preventDefault();
        e.returnValue = isDraftFormId(formId)
          ? "Are you sure you want to leave the playground? Any draft changes will be lost permanently."
          : "Are you sure? Any unsaved changes will be lost.";
        return e.returnValue;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [dirty, formId]);

  const fetchFormDetails = async () => {
    if (isUiOnlyMode() || isDraftFormId(formId)) {
      const stored = useUIStore.getState().activeForm;
      if (stored && isDraftFormId(stored.id)) {
        setActiveForm(stored);
      } else {
        setActiveForm(buildDraftForm({ title: "Untitled Form" }));
      }
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/forms/${formId}`);
      if (res.ok) {
        const data = await res.json();
        const formObj = {
          id: data.form.id,
          title: data.form.title,
          description: data.form.description,
          category: data.form.category || "General",
          isPublished: data.form.isPublished,
          slug: data.form.slug,
          views: data.form.views || 0,
          fields: typeof data.form.fields === "string" ? JSON.parse(data.form.fields) : data.form.fields || [],
          steps: typeof data.form.steps === "string" ? JSON.parse(data.form.steps) : data.form.steps || [],
          landingPage: {
            enabled: false,
            heroTitle: data.form.title,
            heroSubtitle: data.form.description || "",
            faqs: [],
            contactEmail: "",
            contactPhone: "",
            ...(typeof data.form.landingPage === "string" ? JSON.parse(data.form.landingPage) : data.form.landingPage)
          },
          settings: {
            brandColor: "emerald",
            thankYouTitle: "Thank You!",
            thankYouMessage: "Your submission has been recorded.",
            headerEnabled: true,
            headerTitle: data.form.title,
            headerSubtitle: data.form.description || "Complete the form below.",
            footerEnabled: true,
            footerText: "Powered by ANSH Forms",
            canvasBackground: "gradient",
            ...(typeof data.form.settings === "string" ? JSON.parse(data.form.settings) : data.form.settings)
          }
        };
        setActiveForm(formObj);
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Error loading form builder details:", err);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!activeForm) return;

    if (isUiOnlyMode() || isDraftFormId(formId)) {
      setSaving(true);
      setDirty(false);
      setSaving(false);
      useUIStore.getState().addGlobalAlert("success", "Changes previewed successfully!");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: activeForm.title,
          description: activeForm.description,
          category: activeForm.category || "General",
          isPublished: activeForm.isPublished,
          slug: activeForm.slug,
          fields: activeForm.fields,
          steps: activeForm.steps,
          landingPage: activeForm.landingPage,
          settings: activeForm.settings
        })
      });

      if (res.ok) {
        setDirty(false);
        useUIStore.getState().addGlobalAlert("success", "Changes saved successfully!");
      }
    } catch (err) {
      console.error("Failed to save changes:", err);
    } finally {
      setSaving(false);
    }
  };

  const handlePublishForm = async () => {
    if (!activeForm) return;
    setSaving(true);
    try {
      const updatedForm = { ...activeForm, isPublished: true };
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedForm.title,
          description: updatedForm.description,
          category: updatedForm.category || "General",
          isPublished: true,
          slug: updatedForm.slug,
          fields: updatedForm.fields || [],
          steps: updatedForm.steps || [],
          landingPage: updatedForm.landingPage || {},
          settings: updatedForm.settings || {},
        })
      });
      if (res.ok) {
        setActiveForm(updatedForm);
        setDirty(false);
        useUIStore.getState().addGlobalAlert("success", "Form published! It is now live on the web.");
      } else {
        const errData = await res.json();
        useUIStore.getState().addGlobalAlert("generic", errData.error || "Failed to publish form.");
      }
    } catch (err) {
      console.error("Failed to publish form:", err);
      useUIStore.getState().addGlobalAlert("generic", "An error occurred while publishing.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublishForm = async () => {
    if (!activeForm) return;
    setSaving(true);
    try {
      const updatedForm = { ...activeForm, isPublished: false };
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedForm.title,
          description: updatedForm.description,
          category: updatedForm.category || "General",
          isPublished: false,
          slug: updatedForm.slug,
          fields: updatedForm.fields || [],
          steps: updatedForm.steps || [],
          landingPage: updatedForm.landingPage || {},
          settings: updatedForm.settings || {},
        })
      });
      if (res.ok) {
        setActiveForm(updatedForm);
        setDirty(false);
        useUIStore.getState().addGlobalAlert("success", "Form offline (Draft mode).");
      } else {
        const errData = await res.json();
        useUIStore.getState().addGlobalAlert("generic", errData.error || "Failed to unpublish form.");
      }
    } catch (err) {
      console.error("Failed to unpublish form:", err);
      useUIStore.getState().addGlobalAlert("generic", "An error occurred while unpublishing.");
    } finally {
      setSaving(false);
    }
  };

  // Add field to list
  const addField = (fieldType: string) => {
    if (!activeForm) return;
    const defaultOptions = ["Option 1", "Option 2", "Option 3"];
    const needsOptions = ["dropdown", "radio", "checkbox"].includes(fieldType);
    
    const newField = {
      id: `${fieldType}_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType.charAt(0).toUpperCase() + fieldType.slice(1)} Field`,
      placeholder: `Enter your answer here`,
      required: false,
      options: needsOptions ? defaultOptions : undefined
    };

    updateFields([...activeForm.fields, newField]);
    setSelectedCanvasSection(null);
    setSelectedFieldId(newField.id);
    setDirty(true);
  };

  // Field mutations
  const updateFieldDetails = (fieldId: string, updates: Partial<{
    id: string;
    type: string;
    label: string;
    placeholder: string;
    required: boolean;
    options?: string[];
  }>) => {
    if (!activeForm) return;
    const updated = activeForm.fields.map((f) => {
      if (f.id === fieldId) {
        return { ...f, ...updates };
      }
      return f;
    });
    updateFields(updated);
    setDirty(true);
  };

  const deleteField = (fieldId: string) => {
    if (!activeForm) return;
    updateFields(activeForm.fields.filter((f) => f.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
    setDirty(true);
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (!activeForm) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= activeForm.fields.length) return;

    const reordered = [...activeForm.fields];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    updateFields(reordered);
    setDirty(true);
  };

  // Add choice option
  const addOption = (fieldId: string) => {
    const text = newOptionTexts[fieldId]?.trim();
    if (!text || !activeForm) return;

    const field = activeForm.fields.find((f) => f.id === fieldId);
    if (!field) return;

    const options = [...(field.options || []), text];
    updateFieldDetails(fieldId, { options });
    setNewOptionTexts({ ...newOptionTexts, [fieldId]: "" });
    setDirty(true);
  };

  const removeOption = (fieldId: string, optionIdx: number) => {
    if (!activeForm) return;
    const field = activeForm.fields.find((f) => f.id === fieldId);
    if (!field || !field.options) return;

    const options = field.options.filter((_, idx) => idx !== optionIdx);
    updateFieldDetails(fieldId, { options });
    setDirty(true);
  };

  // FAQ additions
  const addFAQ = () => {
    if (!faqQ.trim() || !faqA.trim() || !activeForm) return;
    const faqs = [...(activeForm.landingPage.faqs || []), { question: faqQ, answer: faqA }];
    updateLandingPage({ faqs });
    setFaqQ("");
    setFaqA("");
    setDirty(true);
  };

  const removeFAQ = (idx: number) => {
    if (!activeForm) return;
    const faqs = activeForm.landingPage.faqs.filter((_, i) => i !== idx);
    updateLandingPage({ faqs });
    setDirty(true);
  };

  const copyPublicLink = () => {
    if (!activeForm) return;
    navigator.clipboard.writeText(getFormPublicUrl(activeForm.slug));
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-black tracking-widest uppercase text-slate-400">Loading Form Structure...</span>
      </div>
    );
  }

  if (!activeForm) return null;

  const canvasBackground = activeForm.settings?.canvasBackground || "gradient";
  const canvasBackgroundClass = {
    gradient: "builder-canvas-bg",
    mesh: "builder-canvas-bg-mesh",
    dots: "builder-canvas-bg-dots",
    aurora: "builder-canvas-bg-aurora",
    silk: "builder-canvas-bg-silk",
    noir: "builder-canvas-bg-noir",
  }[canvasBackground] || "builder-canvas-bg";

  const headerEnabled = activeForm.settings?.headerEnabled ?? true;
  const footerEnabled = activeForm.settings?.footerEnabled ?? true;
  const headerTitle = activeForm.settings?.headerTitle || activeForm.title || "Untitled Form";
  const headerSubtitle = activeForm.settings?.headerSubtitle || activeForm.description || "Please fill in the details below.";
  const footerText = activeForm.settings?.footerText || "Powered by ANSH Forms";

  return (
    <div className="form-builder flex h-full min-h-0 flex-col">
      {/* Builder toolbar */}
      <header className="shrink-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4">
        {/* LEFT: Back + Form title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (isDraftFormId(formId) || dirty) {
                setShowExitConfirm(true);
              } else {
                router.push("/forms");
              }
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Back to forms"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {activeForm.title}
              </h1>
              <span className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase",
                activeForm.isPublished
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-slate-500/10 text-slate-500 border-slate-500/20"
              )}>
                {activeForm.isPublished ? "Published" : isDraftFormId(formId) ? "UI Preview" : "Draft"}
              </span>
            </div>
            <p className="truncate text-[10px] font-semibold text-slate-400">
              {activeTopTab === "builder" ? "Form Builder Canvas" : "Responses Dashboard"}
            </p>
          </div>
        </div>

        {/* CENTER: Tab switcher */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl border border-border/70 bg-slate-100/80 dark:bg-slate-800/60 p-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTopTab("builder")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTopTab === "builder"
                ? "bg-card text-slate-800 dark:text-zinc-100 shadow-sm border border-border/60"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            )}
          >
            <ListOrdered className="h-3.5 w-3.5" />
            <span>Builder</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTopTab("responses")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
              activeTopTab === "responses"
                ? "bg-card text-slate-800 dark:text-zinc-100 shadow-sm border border-border/60"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
            )}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            <span>Responses</span>
          </button>
        </div>

        {/* RIGHT: Action buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setFormSettingsOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Form Settings</span>
          </button>

          {dirty && (
            <button
              type="button"
              onClick={handleSaveChanges}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-[10px] font-black uppercase tracking-wider text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>{saving ? "Saving..." : "Save"}</span>
            </button>
          )}

          {!isDraftFormId(formId) && (
            activeForm.isPublished ? (
              <button
                type="button"
                onClick={handleUnpublishForm}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 px-3 py-2 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span>Unpublish</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublishForm}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 px-3 py-2 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-colors"
              >
                <span>Publish</span>
              </button>
            )
          )}

          {activeForm.isPublished && (
            <>
              <button
                type="button"
                onClick={() => setQrModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-border/80 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                title="Show form QR code"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">QR</span>
              </button>
              <button
                type="button"
                onClick={copyPublicLink}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-border/80 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Share</span>
              </button>
            </>
          )}

          <a
            href={`/f/${activeForm.slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-border/80 px-3 py-2 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </a>
        </div>
      </header>

      {/* Form-level settings drawer (title, branding, landing) */}
      {formSettingsOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/45" onClick={() => setFormSettingsOpen(false)} aria-hidden />
          <aside className="fixed left-0 top-0 bottom-0 z-50 flex w-[min(100vw,380px)] flex-col border-r border-border bg-card shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-zinc-100">Form Settings</h2>
              <button
                type="button"
                onClick={() => setFormSettingsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex border-b border-border/40 px-3 pt-2 gap-1 shrink-0">
              {[
                { id: "general", label: "General", icon: Settings },
                { id: "branding", label: "Branding", icon: Palette },
                { id: "design", label: "Design", icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveLeftTab(tab.id as "general" | "branding" | "design")}
                    className={cn(
                      "flex-1 py-2 px-2 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition-all",
                      activeLeftTab === tab.id
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    )}
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {activeLeftTab === "general" && (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Form Name</label>
                <input
                  type="text"
                  value={activeForm.title}
                  onChange={(e) => {
                    setActiveForm({ ...activeForm, title: e.target.value });
                    setDirty(true);
                  }}
                  className="premium-input text-xs font-bold"
                  required
                />
              </div>

              {/* Form Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Form Description</label>
                <textarea
                  value={activeForm.description || ""}
                  onChange={(e) => {
                    setActiveForm({ ...activeForm, description: e.target.value });
                    setDirty(true);
                  }}
                  className="premium-input text-xs h-20 resize-none font-semibold"
                  placeholder="Enter brief form description..."
                />
              </div>

              {/* Form Category */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Category</label>
                <select
                  value={activeForm.category || "General"}
                  onChange={(e) => {
                    setActiveForm({ ...activeForm, category: e.target.value });
                    setDirty(true);
                  }}
                  className="premium-input text-xs font-semibold bg-card"
                >
                  <option value="General">General</option>
                  <option value="Registration">Registration</option>
                  <option value="Feedback">Feedback</option>
                  <option value="Lead Gen">Lead Gen</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              {/* Form Publish state */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Publish Visibility</label>
                <div className="flex items-center gap-3 mt-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveForm({ ...activeForm, isPublished: !activeForm.isPublished });
                      setDirty(true);
                    }}
                    className={cn(
                      "w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer",
                      activeForm.isPublished ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200",
                      activeForm.isPublished ? "translate-x-5.5" : "translate-x-0"
                    )} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-350 select-none">
                    {activeForm.isPublished ? "Published (Visible on web)" : "Draft Mode (Hidden)"}
                  </span>
                </div>
              </div>

              {/* Form Link Slug Customization */}
              <div className="space-y-1 pt-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Public Link URL Slug</label>
                <div className="flex gap-2">
                  <span className="inline-flex items-center px-3 rounded-xl border border-r-0 border-border/80 bg-slate-100 dark:bg-[#121625]/60 text-[10px] font-mono text-slate-400">
                    /f/
                  </span>
                  <input
                    type="text"
                    value={activeForm.slug}
                    onChange={(e) => {
                      const sanitized = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                      setActiveForm({ ...activeForm, slug: sanitized });
                      setDirty(true);
                    }}
                    className="premium-input text-xs rounded-l-none"
                  />
                </div>
              </div>
            </div>
              )}

          {/* TAB 2: BRANDING DETAILS */}
          {activeLeftTab === "branding" && (
            <div className="space-y-4 pt-1">
              {/* Accent selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Accent Theme Color</label>
                <div className="flex gap-2.5 mt-1 select-none">
                  {[
                    { id: "emerald", label: "Teal", color: "bg-emerald-500" },
                    { id: "amber", label: "Amber", color: "bg-amber-500" },
                    { id: "ocean", label: "Ocean", color: "bg-sky-500" },
                    { id: "purple", label: "Purple", color: "bg-purple-500" }
                  ].map((accent) => (
                    <button
                      key={accent.id}
                      onClick={() => {
                        updateSettings({ brandColor: accent.id });
                        setDirty(true);
                      }}
                      className={cn(
                        "h-8 flex-1 rounded-xl flex items-center justify-center transition-all cursor-pointer border text-[10px] font-black uppercase text-white hover:scale-105",
                        activeForm.settings?.brandColor === accent.id
                          ? "border-zinc-800 ring-2 ring-primary ring-offset-2 ring-offset-card"
                          : "border-transparent"
                      )}
                      style={{ backgroundColor: `var(--primary)` }}
                    >
                      <div className={cn("h-4 w-4 rounded-full border border-white/20 shrink-0", accent.color)} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Logo and Cover Image URLs */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Logo URL (Optional)</label>
                <input
                  type="text"
                  value={activeForm.settings?.logoUrl || ""}
                  onChange={(e) => {
                    updateSettings({ logoUrl: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="https://your-domain.com/logo.png"
                  className="premium-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cover Image URL (Optional)</label>
                <input
                  type="text"
                  value={activeForm.settings?.coverUrl || ""}
                  onChange={(e) => {
                    updateSettings({ coverUrl: e.target.value });
                    setDirty(true);
                  }}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="premium-input text-xs"
                />
              </div>

              {/* Custom Thank you submission success screen */}
              <div className="pt-4 border-t border-border/40 space-y-3">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                  Submit Success Page
                </span>
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Success Header Title</label>
                  <input
                    type="text"
                    value={activeForm.settings?.thankYouTitle || ""}
                    onChange={(e) => {
                      updateSettings({ thankYouTitle: e.target.value });
                      setDirty(true);
                    }}
                    className="premium-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Success Detail Message</label>
                  <textarea
                    value={activeForm.settings?.thankYouMessage || ""}
                    onChange={(e) => {
                      updateSettings({ thankYouMessage: e.target.value });
                      setDirty(true);
                    }}
                    className="premium-input text-xs h-16 resize-none font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DESIGN CONTROLS */}
          {activeLeftTab === "design" && (
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Header Section</label>
                <div className="flex items-center gap-3 mt-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ headerEnabled: !(activeForm.settings?.headerEnabled ?? true) });
                      setDirty(true);
                    }}
                    className={cn(
                      "w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer",
                      (activeForm.settings?.headerEnabled ?? true) ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200",
                      (activeForm.settings?.headerEnabled ?? true) ? "translate-x-5.5" : "translate-x-0"
                    )} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-350">
                    {(activeForm.settings?.headerEnabled ?? true) ? "Header visible on canvas" : "Header hidden"}
                  </span>
                </div>
              </div>

              {(activeForm.settings?.headerEnabled ?? true) && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Header Title</label>
                    <input
                      type="text"
                      value={activeForm.settings?.headerTitle || ""}
                      onChange={(e) => {
                        updateSettings({ headerTitle: e.target.value });
                        setDirty(true);
                      }}
                      className="premium-input text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Header Subtitle</label>
                    <textarea
                      value={activeForm.settings?.headerSubtitle || ""}
                      onChange={(e) => {
                        updateSettings({ headerSubtitle: e.target.value });
                        setDirty(true);
                      }}
                      className="premium-input text-xs h-16 resize-none font-semibold"
                    />
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-border/40 space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Footer Section</label>
                <div className="flex items-center gap-3 mt-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ footerEnabled: !(activeForm.settings?.footerEnabled ?? true) });
                      setDirty(true);
                    }}
                    className={cn(
                      "w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer",
                      (activeForm.settings?.footerEnabled ?? true) ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200",
                      (activeForm.settings?.footerEnabled ?? true) ? "translate-x-5.5" : "translate-x-0"
                    )} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-350">
                    {(activeForm.settings?.footerEnabled ?? true) ? "Footer visible on canvas" : "Footer hidden"}
                  </span>
                </div>
              </div>

              {(activeForm.settings?.footerEnabled ?? true) && (
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Footer Text</label>
                  <input
                    type="text"
                    value={activeForm.settings?.footerText || ""}
                    onChange={(e) => {
                      updateSettings({ footerText: e.target.value });
                      setDirty(true);
                    }}
                    className="premium-input text-xs"
                  />
                </div>
              )}

              <div className="pt-3 border-t border-border/40 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Canvas Background Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {DESIGN_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        updateSettings({ canvasBackground: bg.id });
                        setDirty(true);
                      }}
                      className={cn(
                        "rounded-xl border px-2.5 py-2 text-[10px] font-black uppercase tracking-wider cursor-pointer transition-all",
                        (activeForm.settings?.canvasBackground || "gradient") === bg.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/70 text-slate-500 hover:text-slate-700 dark:hover:text-zinc-200"
                      )}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LANDING PAGE CMS */}
          {activeLeftTab === "landing" && (
            <div className="space-y-4 pt-1">
              {/* Landing Page mode enable toggle */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Landing Page Site Mode</label>
                <div className="flex items-center gap-3 mt-1 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      updateLandingPage({ enabled: !activeForm.landingPage?.enabled });
                      setDirty(true);
                    }}
                    className={cn(
                      "w-12 h-6.5 rounded-full p-1 transition-colors duration-200 focus:outline-none cursor-pointer",
                      activeForm.landingPage?.enabled ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                    )}
                  >
                    <div className={cn(
                      "bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200",
                      activeForm.landingPage?.enabled ? "translate-x-5.5" : "translate-x-0"
                    )} />
                  </button>
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-350">
                    {activeForm.landingPage?.enabled ? "Enabled (Hero + FAQ site)" : "Disabled (Form card only)"}
                  </span>
                </div>
              </div>

              {/* Configure marketing content if enabled */}
              {activeForm.landingPage?.enabled && (
                <div className="space-y-3.5 pt-2 border-t border-border/40 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hero Section Header Title</label>
                    <input
                      type="text"
                      value={activeForm.landingPage?.heroTitle || ""}
                      onChange={(e) => {
                        updateLandingPage({ heroTitle: e.target.value });
                        setDirty(true);
                      }}
                      className="premium-input text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Hero Subtitle Text</label>
                    <textarea
                      value={activeForm.landingPage?.heroSubtitle || ""}
                      onChange={(e) => {
                        updateLandingPage({ heroSubtitle: e.target.value });
                        setDirty(true);
                      }}
                      className="premium-input text-xs h-16 resize-none font-semibold"
                    />
                  </div>

                  {/* FAQ list builder */}
                  <div className="pt-2 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">FAQs Accordion Builder</label>
                    
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                      {activeForm.landingPage?.faqs?.map((faq, idx) => (
                        <div key={idx} className="flex justify-between items-start bg-slate-50 dark:bg-zinc-900/30 p-2 rounded-lg border border-border/40 text-[10px]">
                          <div className="flex-1 truncate pr-2 font-semibold">
                            <div className="font-black text-slate-800 dark:text-zinc-200 truncate">Q: {faq.question}</div>
                            <div className="text-slate-500 truncate mt-0.5">A: {faq.answer}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFAQ(idx)}
                            className="text-slate-400 hover:text-rose-500 shrink-0 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl border border-border bg-slate-50/30 dark:bg-[#121625]/20 space-y-2">
                      <input
                        type="text"
                        value={faqQ}
                        onChange={(e) => setFaqQ(e.target.value)}
                        placeholder="FAQ Question..."
                        className="premium-input text-[11px] py-1.5"
                      />
                      <textarea
                        value={faqA}
                        onChange={(e) => setFaqA(e.target.value)}
                        placeholder="FAQ Answer details..."
                        className="premium-input text-[11px] h-12 py-1.5 resize-none"
                      />
                      <button
                        type="button"
                        onClick={addFAQ}
                        disabled={!faqQ.trim() || !faqA.trim()}
                        className="w-full py-1.5 rounded-lg bg-primary text-primary-foreground font-black text-[10px] uppercase hover:opacity-90 disabled:opacity-40 cursor-pointer"
                      >
                        Add FAQ Accordion
                      </button>
                    </div>
                  </div>

                  {/* Corporate Contact info details */}
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Footer Contact Details</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400">Email Address</label>
                        <input
                          type="email"
                          value={activeForm.landingPage?.contactEmail || ""}
                          onChange={(e) => {
                            updateLandingPage({ contactEmail: e.target.value });
                            setDirty(true);
                          }}
                          placeholder="inquire@school.com"
                          className="premium-input text-[11px] py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] font-black uppercase text-slate-400">Phone Number</label>
                        <input
                          type="text"
                          value={activeForm.landingPage?.contactPhone || ""}
                          onChange={(e) => {
                            updateLandingPage({ contactPhone: e.target.value });
                            setDirty(true);
                          }}
                          placeholder="+91..."
                          className="premium-input text-[11px] py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
            </div>
          </aside>
        </>
      )}

      {/* Responses Tab View */}
      {activeTopTab === "responses" && (
        <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
          <ResponsesPage />
        </div>
      )}

      {/* Three-panel builder workspace (hidden when on responses tab) */}
      <div className={cn("flex flex-1 min-h-0", activeTopTab === "responses" && "hidden")}>
        {/* LEFT: Field types palette */}
        <aside className="flex w-[260px] shrink-0 flex-col border-r border-border bg-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-3">
            <span className="builder-panel-title text-[10px] font-black uppercase tracking-widest text-slate-400">Add Fields</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {FIELD_TYPES.map((field) => {
              const Icon = field.icon;
              return (
                <button
                  key={field.type}
                  type="button"
                  onClick={() => addField(field.type)}
                  className="builder-palette-btn flex w-full items-center gap-2.5 rounded-xl border border-border/50 bg-slate-50/50 px-3 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-100 dark:text-zinc-100 cursor-pointer duration-200"
                >
                  <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                  <span className="flex-1 truncate">{field.label}</span>
                  <Plus className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </button>
              );
            })}
          </div>
        </aside>

        {/* CENTER: Full canvas */}
        <main className={`${canvasBackgroundClass} flex-1 min-w-0 overflow-y-auto p-6 md:p-8`}>
          <div className="mx-auto flex min-h-full max-w-2xl flex-col">
            <div className="mb-4 flex items-center justify-between">
              <span className="builder-panel-title text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Form Canvas</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFieldId(null);
                    setSelectedCanvasSection("background");
                  }}
                  className="rounded-md border border-border/70 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 dark:text-zinc-350 dark:hover:text-zinc-100 cursor-pointer"
                >
                  Background
                </button>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">{activeForm.fields.length} field{activeForm.fields.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <div className="builder-canvas-surface flex flex-1 flex-col rounded-2xl p-6 min-h-[calc(100vh-10rem)]">
            {headerEnabled && (
              <div
                onClick={() => {
                  setSelectedFieldId(null);
                  setSelectedCanvasSection("header");
                }}
                className={cn(
                  "mb-5 rounded-xl border bg-card/70 px-4 py-3 cursor-pointer",
                  selectedCanvasSection === "header" ? "border-primary ring-1 ring-primary/30" : "border-border/60"
                )}
              >
                <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100">{headerTitle}</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-zinc-400">{headerSubtitle}</p>
              </div>
            )}
            {activeForm.fields.length === 0 ? (
              <div className="builder-empty-state flex-1 border-2 border-dashed border-primary/25 bg-card/40 rounded-2xl flex flex-col items-center justify-center p-8 text-center my-auto">
                <Plus className="h-8 w-8 text-slate-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">Canvas Is Empty</h4>
                <p className="text-[11px] text-slate-400 max-w-[220px] mt-1">
                  Pick a field type from the left panel to add it to your form canvas.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeForm.fields.map((field, index) => {
                  const itemConfig = FIELD_TYPES.find((f) => f.type === field.type);
                  const Icon = itemConfig?.icon || Type;
                  const isSelected = selectedFieldId === field.id;

                  return (
                    <div
                      key={field.id}
                      onClick={() => {
                        setSelectedCanvasSection(null);
                        setSelectedFieldId(field.id);
                      }}
                      className={cn(
                        "builder-field-card p-4 rounded-xl border transition-all relative group cursor-pointer",
                        isSelected
                          ? "builder-field-card--selected border-primary shadow-md shadow-primary/10 ring-1 ring-primary/30"
                          : "border-border/70 bg-card hover:border-primary/30 hover:shadow-sm"
                      )}
                    >
                      {/* Field header and position controllers */}
                      <div className="flex justify-between items-center mb-2 select-none">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                          <span className="builder-field-meta text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">
                            {field.type} Field
                          </span>
                          {field.required && (
                            <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider">
                              * Required
                            </span>
                          )}
                        </div>

                        {/* Reordering and deleting items buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => { e.stopPropagation(); moveField(index, "up"); }}
                            disabled={index === 0}
                            className="h-6 w-6 rounded border border-border bg-card flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); moveField(index, "down"); }}
                            disabled={index === activeForm.fields.length - 1}
                            className="h-6 w-6 rounded border border-border bg-card flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                            className="h-6 w-6 rounded border border-border bg-card flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-955/20 cursor-pointer"
                            title="Delete Field"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Question Label text */}
                      <div className="builder-field-label font-bold text-xs text-slate-800 dark:text-zinc-100">
                        {field.label || "Untitled Field Question"}
                      </div>
                      
                      {/* Sub-inputs preview */}
                      <div className="mt-2.5">
                        {field.type === "textarea" ? (
                          <div className="builder-input-preview w-full h-12 rounded-lg border text-[11px] p-2 italic font-semibold">
                            {field.placeholder}
                          </div>
                        ) : ["dropdown", "radio", "checkbox"].includes(field.type) ? (
                          <div className="space-y-1.5">
                            {field.options?.map((opt, oIdx) => (
                              <div key={oIdx} className="builder-option-text flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-300 font-bold">
                                {field.type === "dropdown" && <span className="text-slate-400 dark:text-zinc-400 font-mono">{oIdx+1}.</span>}
                                {field.type === "radio" && <span className="h-3 w-3 rounded-full border border-slate-350 dark:border-zinc-500 block shrink-0" />}
                                {field.type === "checkbox" && <span className="h-3 w-3 rounded border border-slate-350 dark:border-zinc-500 block shrink-0" />}
                                <span>{opt}</span>
                              </div>
                            ))}
                          </div>
                        ) : field.type === "rating" ? (
                          <div className="flex gap-1 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4.5 w-4.5 fill-current" />)}
                          </div>
                        ) : field.type === "signature" ? (
                          <div className="builder-input-preview w-full h-16 rounded-xl border border-dashed flex items-center justify-center text-[10px] font-bold italic text-slate-400">
                            E-Signature pad
                          </div>
                        ) : (
                          <div className="builder-input-preview w-full py-2 px-3 rounded-lg border text-[11px] italic font-semibold">
                            {field.placeholder}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {footerEnabled && (
              <div
                onClick={() => {
                  setSelectedFieldId(null);
                  setSelectedCanvasSection("footer");
                }}
                className={cn(
                  "mt-5 rounded-xl border bg-card/65 px-4 py-3 text-center cursor-pointer",
                  selectedCanvasSection === "footer" ? "border-primary ring-1 ring-primary/30" : "border-border/50"
                )}
              >
                <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{footerText}</p>
              </div>
            )}
            </div>
          </div>
        </main>

        {/* RIGHT: Field properties */}
        <aside className="flex w-[300px] shrink-0 flex-col border-l border-border bg-card overflow-hidden">
          <div className="border-b border-border/60 px-4 py-3">
            <span className="builder-panel-title text-[10px] font-black uppercase tracking-widest text-slate-400">
              {selectedFieldId ? "Field Settings" : selectedCanvasSection === "header" ? "Header Settings" : selectedCanvasSection === "footer" ? "Footer Settings" : selectedCanvasSection === "background" ? "Background Settings" : "Field Settings"}
            </span>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto p-4">
            {selectedFieldId ? (
              <div className="space-y-4 animate-fadeIn flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* Field Label */}
                  <div className="space-y-1">
                    <label className="builder-panel-title text-[9px] font-black uppercase text-slate-400 tracking-wider">Question Label</label>
                    <input
                      type="text"
                      value={activeForm.fields.find((f) => f.id === selectedFieldId)?.label || ""}
                      onChange={(e) => updateFieldDetails(selectedFieldId, { label: e.target.value })}
                      className="premium-input text-xs"
                    />
                  </div>

                  {/* Placeholder hint (Hide for date/rating/signature/file) */}
                  {!["date", "rating", "signature", "file"].includes(activeForm.fields.find((f) => f.id === selectedFieldId)?.type || "") && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Placeholder Hint</label>
                      <input
                        type="text"
                        value={activeForm.fields.find((f) => f.id === selectedFieldId)?.placeholder || ""}
                        onChange={(e) => updateFieldDetails(selectedFieldId, { placeholder: e.target.value })}
                        className="premium-input text-xs"
                      />
                    </div>
                  )}

                  {/* Required check state toggle */}
                  <div className="flex items-center gap-2.5 select-none pt-1">
                    <input
                      type="checkbox"
                      id="req_toggle"
                      checked={activeForm.fields.find((f) => f.id === selectedFieldId)?.required || false}
                      onChange={(e) => updateFieldDetails(selectedFieldId, { required: e.target.checked })}
                      className="rounded border-slate-350 text-primary focus:ring-primary/20 h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="req_toggle" className="text-xs font-bold text-slate-700 dark:text-zinc-300 cursor-pointer">
                      Mark field as Mandatory
                    </label>
                  </div>

                  {/* Multi-choices builder options */}
                  {["dropdown", "radio", "checkbox"].includes(activeForm.fields.find((f) => f.id === selectedFieldId)?.type || "") && (
                    <div className="space-y-2.5 pt-2 border-t border-border/40">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Choices / Options</label>
                      
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {activeForm.fields.find((f) => f.id === selectedFieldId)?.options?.map((opt, oIdx) => (
                          <div key={oIdx} className="flex justify-between items-center bg-slate-50 dark:bg-zinc-900/30 p-2 rounded-lg border border-border/40">
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-200 truncate">{opt}</span>
                            <button
                              type="button"
                              onClick={() => removeOption(selectedFieldId, oIdx)}
                              className="text-slate-400 hover:text-rose-500 cursor-pointer"
                              title="Delete Choice"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add option input row */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newOptionTexts[selectedFieldId] || ""}
                          onChange={(e) => setNewOptionTexts({ ...newOptionTexts, [selectedFieldId]: e.target.value })}
                          placeholder="Add choice text..."
                          className="premium-input text-xs py-1.5"
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption(selectedFieldId))}
                        />
                        <button
                          type="button"
                          onClick={() => addOption(selectedFieldId)}
                          className="px-3.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Delete Field button */}
                <div className="pt-4 border-t border-border/40 mt-4 select-none">
                  <button
                    type="button"
                    onClick={() => deleteField(selectedFieldId)}
                    className="w-full py-2.5 rounded-xl border border-rose-200 dark:border-rose-955 bg-rose-50/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 transition-all font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Question</span>
                  </button>
                </div>
              </div>
            ) : selectedCanvasSection === "header" ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Header Visibility</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ headerEnabled: !(activeForm.settings?.headerEnabled ?? true) });
                        setDirty(true);
                      }}
                      className={cn(
                        "w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer",
                        (activeForm.settings?.headerEnabled ?? true) ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                      )}
                    >
                      <div className={cn(
                        "bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200",
                        (activeForm.settings?.headerEnabled ?? true) ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-350">
                      {(activeForm.settings?.headerEnabled ?? true) ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>

                {(activeForm.settings?.headerEnabled ?? true) && (
                  <>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Header Title</label>
                      <input
                        type="text"
                        value={activeForm.settings?.headerTitle || ""}
                        onChange={(e) => {
                          updateSettings({ headerTitle: e.target.value });
                          setDirty(true);
                        }}
                        className="premium-input text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Header Subtitle</label>
                      <textarea
                        value={activeForm.settings?.headerSubtitle || ""}
                        onChange={(e) => {
                          updateSettings({ headerSubtitle: e.target.value });
                          setDirty(true);
                        }}
                        className="premium-input text-xs h-20 resize-none font-semibold"
                      />
                    </div>
                  </>
                )}
              </div>
            ) : selectedCanvasSection === "footer" ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Footer Visibility</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        updateSettings({ footerEnabled: !(activeForm.settings?.footerEnabled ?? true) });
                        setDirty(true);
                      }}
                      className={cn(
                        "w-10 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer",
                        (activeForm.settings?.footerEnabled ?? true) ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"
                      )}
                    >
                      <div className={cn(
                        "bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-200",
                        (activeForm.settings?.footerEnabled ?? true) ? "translate-x-4" : "translate-x-0"
                      )} />
                    </button>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-350">
                      {(activeForm.settings?.footerEnabled ?? true) ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                </div>
                {(activeForm.settings?.footerEnabled ?? true) && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Footer Text</label>
                    <input
                      type="text"
                      value={activeForm.settings?.footerText || ""}
                      onChange={(e) => {
                        updateSettings({ footerText: e.target.value });
                        setDirty(true);
                      }}
                      className="premium-input text-xs"
                    />
                  </div>
                )}
              </div>
            ) : selectedCanvasSection === "background" ? (
              <div className="space-y-3 animate-fadeIn">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Choose Background</label>
                <div className="grid grid-cols-2 gap-2">
                  {DESIGN_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => {
                        updateSettings({ canvasBackground: bg.id });
                        setDirty(true);
                      }}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-[9px] font-black uppercase tracking-wider cursor-pointer",
                        (activeForm.settings?.canvasBackground || "gradient") === bg.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border/70 text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
                      )}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="builder-empty-state my-auto py-10 text-center flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl select-none">
                <Sparkles className="h-7 w-7 text-slate-400 dark:text-zinc-400" />
                <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-100">No Item Selected</h4>
                <p className="text-[10px] text-slate-400 dark:text-zinc-400 max-w-[160px] leading-relaxed mt-0.5">
                  Click a field, header, footer, or background button to edit settings.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
      {/* End of builder workspace div */}

      {/* EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
          <div className="absolute inset-0" onClick={() => setShowExitConfirm(false)} aria-hidden />
          
          <div className="bg-card w-full max-w-[480px] rounded-3xl border border-border shadow-2xl p-6 relative z-10 animate-fadeInDown flex flex-col">
            <div className="flex items-center gap-3 text-amber-500 mb-4 select-none">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black uppercase tracking-wider">
                  {isDraftFormId(formId) ? "Leave Playground?" : "Unsaved Changes"}
                </h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 font-semibold mt-0.5">
                  {isDraftFormId(formId) ? "Your sandbox preview changes will be lost." : "Any unsaved additions will be discarded."}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                {isDraftFormId(formId)
                  ? "You are currently in UI Preview/Playground mode. If you leave now, all canvas mockups and custom fields will be wiped permanently."
                  : "You have modified this form layout. Leaving without saving will revert all pending edits to the last saved database checkpoint."}
              </p>

              <div className="flex justify-end gap-2 pt-2 select-none">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDirty(false);
                    setShowExitConfirm(false);
                    router.push("/forms");
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FormQrModal
        open={qrModalOpen && !!activeForm?.isPublished}
        onClose={() => setQrModalOpen(false)}
        formTitle={activeForm?.title || "Form"}
        slug={activeForm?.slug || ""}
      />
    </div>
  );
}
