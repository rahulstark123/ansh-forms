"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Type, Mail, Phone, Hash, AlignLeft, ChevronDown, CheckSquare, Radio, Calendar, Star,
  Upload, PenTool, Clock, ArrowLeft, Layers, ListOrdered, BarChart2, Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
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
  { type: "signature", label: "Digital Signature", icon: PenTool }
];

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
}

interface FormDetails {
  id: string;
  title: string;
  description: string;
  category: string;
  isPublished: boolean;
  slug: string;
  views: number;
  fields: FormField[];
  settings: {
    logoUrl?: string;
    brandColor: string;
    coverUrl?: string;
    thankYouTitle: string;
    thankYouMessage: string;
    headerEnabled?: boolean;
    headerTitle?: string;
    headerSubtitle?: string;
    footerEnabled?: boolean;
    footerText?: string;
    canvasBackground?: "gradient" | "mesh" | "dots" | "aurora" | "silk" | "noir";
  };
}

export default function FormViewPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const setActiveForm = useUIStore((state) => state.setActiveForm);

  const [form, setForm] = useState<FormDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTopTab, setActiveTopTab] = useState<"builder" | "responses">("builder");

  useEffect(() => {
    fetchFormDetails();
  }, [formId]);

  const fetchFormDetails = async () => {
    try {
      const res = await fetch(`/api/forms/${formId}`);
      if (res.ok) {
        const data = await res.json();
        const formObj: FormDetails = {
          id: data.form.id,
          title: data.form.title,
          description: data.form.description,
          category: data.form.category || "General",
          isPublished: data.form.isPublished,
          slug: data.form.slug,
          views: data.form.views || 0,
          fields: typeof data.form.fields === "string" ? JSON.parse(data.form.fields) : data.form.fields || [],
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
        setForm(formObj);
        // Sync to UIStore so ResponsesPage can pick up form details
        setActiveForm({
          ...formObj,
          steps: [],
          landingPage: { enabled: false, heroTitle: formObj.title, heroSubtitle: formObj.description || "", faqs: [], contactEmail: "", contactPhone: "" },
        } as any);
      } else {
        router.push("/forms");
      }
    } catch (err) {
      console.error("Error loading form view details:", err);
      router.push("/forms");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-black tracking-widest uppercase text-slate-400">Loading Form Preview...</span>
      </div>
    );
  }

  if (!form) return null;

  const canvasBackground = form.settings?.canvasBackground || "gradient";
  const canvasBackgroundClass = {
    gradient: "builder-canvas-bg",
    mesh: "builder-canvas-bg-mesh",
    dots: "builder-canvas-bg-dots",
    aurora: "builder-canvas-bg-aurora",
    silk: "builder-canvas-bg-silk",
    noir: "builder-canvas-bg-noir",
  }[canvasBackground] || "builder-canvas-bg";

  const headerEnabled = form.settings?.headerEnabled ?? true;
  const footerEnabled = form.settings?.footerEnabled ?? true;
  const headerTitle = form.settings?.headerTitle || form.title || "Untitled Form";
  const headerSubtitle = form.settings?.headerSubtitle || form.description || "Please fill in the details below.";
  const footerText = form.settings?.footerText || "Powered by ANSH Forms";

  return (
    <div className="form-builder flex h-full min-h-0 flex-col">
      {/* View mode toolbar */}
      <header className="shrink-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 relative">
        {/* LEFT: Back + Form title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/forms")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            title="Back to forms"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight">
                {form.title}
              </h1>
              <span className="shrink-0 rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 text-[8px] font-black uppercase text-sky-500">
                View Only
              </span>
              <span className={cn(
                "shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-black uppercase",
                form.isPublished
                  ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                  : "bg-slate-500/10 text-slate-500 border-slate-500/20"
              )}>
                {form.isPublished ? "Published" : "Draft"}
              </span>
            </div>
            <p className="truncate text-[10px] font-semibold text-slate-400">
              {activeTopTab === "builder" ? "Form Canvas Preview" : "Responses Dashboard"}
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

        {/* RIGHT: Edit layout button */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => router.push(`/forms/${form.id}/edit`)}
            className="flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary hover:text-primary-foreground text-primary px-3 py-2 text-[10px] font-black uppercase tracking-wider cursor-pointer duration-200"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit Layout</span>
          </button>
        </div>
      </header>

      {/* RESPONSES TAB */}
      {activeTopTab === "responses" && (
        <div className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8">
          <ResponsesPage />
        </div>
      )}

      {/* BUILDER TAB: Read-only canvas */}
      <div className={cn("flex flex-1 min-h-0", activeTopTab === "responses" && "hidden")}>
        <main className={`${canvasBackgroundClass} flex-1 min-w-0 overflow-y-auto p-6 md:p-8`}>
          <div className="mx-auto flex min-h-full max-w-2xl flex-col">
            <div className="mb-4 flex items-center justify-between">
              <span className="builder-panel-title text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                Canvas Preview Layout
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-300">
                {form.fields.length} field{form.fields.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="builder-canvas-surface flex flex-1 flex-col rounded-2xl p-6 min-h-[calc(100vh-10rem)]">
              {headerEnabled && (
                <div className="mb-5 rounded-xl border border-border/60 bg-card/70 px-4 py-3 cursor-default">
                  <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100">{headerTitle}</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-zinc-400">{headerSubtitle}</p>
                </div>
              )}

              {form.fields.length === 0 ? (
                <div className="builder-empty-state flex-1 border-2 border-dashed border-primary/20 bg-card/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center my-auto">
                  <Layers className="h-8 w-8 text-slate-400 mb-2 animate-pulse" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-zinc-300">Canvas Is Empty</h4>
                  <p className="text-[10px] text-slate-400 max-w-[200px] mt-1">
                    This form has no fields yet. Open the editor to add them.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {form.fields.map((field) => {
                    const itemConfig = FIELD_TYPES.find((f) => f.type === field.type);
                    const Icon = itemConfig?.icon || Type;

                    return (
                      <div
                        key={field.id}
                        className="builder-field-card p-4 rounded-xl border border-border/70 bg-card cursor-default relative transition-colors duration-150"
                      >
                        {/* Field header */}
                        <div className="flex items-center gap-2 mb-2 select-none">
                          <Icon className="h-4 w-4 text-slate-400 dark:text-zinc-400" />
                          <span className="builder-field-meta text-[9px] font-black uppercase text-slate-400 font-mono tracking-wider">
                            {field.type} Field
                          </span>
                          {field.required && (
                            <span className="text-[9px] font-black text-rose-500 dark:text-rose-400 uppercase tracking-wider">
                              * Required
                            </span>
                          )}
                          {/* Read-only indicator badge */}
                          <span className="ml-auto text-[8px] font-black uppercase tracking-wider text-sky-500/70 border border-sky-500/20 bg-sky-500/5 px-1.5 py-0.5 rounded-full">
                            Read Only
                          </span>
                        </div>

                        {/* Question Label */}
                        <div className="builder-field-label font-bold text-xs text-slate-800 dark:text-zinc-100">
                          {field.label || "Untitled Field Question"}
                        </div>

                        {/* Input preview */}
                        <div className="mt-2.5">
                          {field.type === "textarea" ? (
                            <div className="builder-input-preview w-full h-12 rounded-lg border text-[11px] p-2 italic font-semibold border-border/50 text-slate-400 bg-slate-50/20 dark:bg-zinc-900/10">
                              {field.placeholder}
                            </div>
                          ) : ["dropdown", "radio", "checkbox"].includes(field.type) ? (
                            <div className="space-y-1.5">
                              {field.options?.map((opt, oIdx) => (
                                <div key={oIdx} className="builder-option-text flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-350 font-bold">
                                  {field.type === "dropdown" && <span className="text-slate-400 dark:text-zinc-400 font-mono">{oIdx + 1}.</span>}
                                  {field.type === "radio" && <span className="h-3 w-3 rounded-full border border-slate-300 dark:border-zinc-700 bg-slate-50/30 dark:bg-zinc-900/10 block shrink-0" />}
                                  {field.type === "checkbox" && <span className="h-3 w-3 rounded border border-slate-300 dark:border-zinc-700 bg-slate-50/30 dark:bg-zinc-900/10 block shrink-0" />}
                                  <span>{opt}</span>
                                </div>
                              ))}
                            </div>
                          ) : field.type === "rating" ? (
                            <div className="flex gap-1 text-amber-400 select-none">
                              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4.5 w-4.5 fill-current" />)}
                            </div>
                          ) : field.type === "signature" ? (
                            <div className="builder-input-preview w-full h-16 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-[10px] font-bold italic text-slate-400 bg-slate-50/20 dark:bg-zinc-900/10">
                              Digital Signature Pad
                            </div>
                          ) : (
                            <div className="builder-input-preview w-full py-2 px-3 rounded-lg border text-[11px] italic font-semibold border-border/50 text-slate-400 bg-slate-50/20 dark:bg-zinc-900/10">
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
                <div className="mt-5 rounded-xl border border-border/50 bg-card/65 px-4 py-3 text-center cursor-default">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">{footerText}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
