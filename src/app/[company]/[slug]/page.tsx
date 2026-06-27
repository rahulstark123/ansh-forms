"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2, ChevronRight, ChevronLeft,
  ArrowRight, HelpCircle, XCircle, Mail, Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FormFieldInput } from "@/components/forms/form-field-input";
import { isDisplayOnlyField } from "@/config/form-fields";
import { uploadFileWithCompression } from "@/lib/upload-file";
import { compressionSummary } from "@/lib/compress-file";

interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  currencySymbol?: string;
}

interface FormDetails {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  slug: string;
  fields: FormField[];
  landingPage: {
    enabled: boolean;
    heroTitle: string;
    heroSubtitle: string;
    faqs: { question: string; answer: string }[];
    contactEmail: string;
    contactPhone: string;
  };
  settings: {
    logoUrl?: string;
    brandColor: string; // emerald, amber, ocean, purple
    coverUrl?: string;
    thankYouTitle: string;
    thankYouMessage: string;
    requiresApproval?: boolean;
  };
}

export default function PublicFormPage() {
  const params = useParams();
  const router = useRouter();
  const company = params.company as string;
  const slug = params.slug as string;

  // States
  const [form, setForm] = useState<FormDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Multi-step pagination
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  
  // Submit success details
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // File Upload statuses
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [fileUploadNotes, setFileUploadNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchPublicForm();
  }, [company, slug]);

  // Log views count once on load
  const incrementViews = async (formId: string) => {
    try {
      await fetch(`/api/forms/public/views`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId })
      });
    } catch (e) {
      // Silently ignore view log failures
    }
  };

  const fetchPublicForm = async () => {
    try {
      const res = await fetch(
        `/api/forms/public?slug=${encodeURIComponent(slug)}&company=${encodeURIComponent(company)}`,
      );
      if (res.ok) {
        const data = await res.json();
        
        const fields = typeof data.form.fields === "string" ? JSON.parse(data.form.fields) : data.form.fields || [];
        const lp = typeof data.form.landingPage === "string" ? JSON.parse(data.form.landingPage) : data.form.landingPage || {};
        const settings = typeof data.form.settings === "string" ? JSON.parse(data.form.settings) : data.form.settings || {};

        const formDetails: FormDetails = {
          id: data.form.id,
          title: data.form.title,
          description: data.form.description,
          isPublished: data.form.isPublished,
          slug: data.form.slug,
          fields,
          landingPage: {
            enabled: false,
            heroTitle: data.form.title,
            heroSubtitle: data.form.description || "",
            faqs: [],
            contactEmail: "",
            contactPhone: "",
            ...lp
          },
          settings: {
            brandColor: "emerald",
            thankYouTitle: "Thank You!",
            thankYouMessage: "Your submission has been recorded.",
            ...settings
          }
        };

        const searchParams = new URLSearchParams(window.location.search);
        const isPreview = searchParams.get("preview") === "true";

        if (!formDetails.isPublished && !isPreview) {
          setError("This form is currently offline (Draft mode).");
        } else {
          setForm(formDetails);
          if (formDetails.isPublished) {
            incrementViews(data.form.id);
          }
        }
      } else {
        setError("Form not found in workspace.");
      }
    } catch (err) {
      console.error("Error loading public form:", err);
      setError("Failed to resolve public form link.");
    } finally {
      setLoading(false);
    }
  };



  // Input changes
  const handleInputChange = (fieldId: string, value: any) => {
    setAnswers({ ...answers, [fieldId]: value });
  };

  const handleCheckboxChange = (fieldId: string, option: string, checked: boolean) => {
    const prev = answers[fieldId] || [];
    if (checked) {
      setAnswers({ ...answers, [fieldId]: [...prev, option] });
    } else {
      setAnswers({ ...answers, [fieldId]: prev.filter((o: string) => o !== option) });
    }
  };

  // File Uploading to API (with image compression)
  const handleFileUpload = async (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFieldId(fieldId);
    try {
      const result = await uploadFileWithCompression(file);
      handleInputChange(fieldId, result.url);
      const note = compressionSummary(result);
      setFileUploadNotes((prev) => {
        const next = { ...prev };
        if (note) next[fieldId] = note;
        else delete next[fieldId];
        return next;
      });
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setUploadingFieldId(null);
      e.target.value = "";
    }
  };

  // Validation
  const validateForm = () => {
    if (!form) return false;
    for (const field of form.fields) {
      if (isDisplayOnlyField(field.type)) continue;
      if (!field.required) continue;

      const val = answers[field.id];
      if (field.type === "consent") {
        if (val !== true) return false;
        continue;
      }
      if (field.type === "toggle") {
        if (val !== true && val !== false) return false;
        continue;
      }
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        return false;
      }
    }
    return true;
  };

  // Submit form data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form || !validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${form.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.requiresApproval) {
          setTrackingId(data.submission.customId);
        }
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Form submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#070913] text-zinc-100 gap-3">
        <div className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <span className="text-xs font-black tracking-widest uppercase text-slate-500">Loading Form Portal</span>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#070913] text-zinc-100 p-6 select-none">
        <div className="h-14 w-14 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20 mb-4">
          <XCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-black tracking-tight">{error || "Access Denied"}</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-xs text-center font-semibold leading-relaxed">
          Please verify your URL slug or contact the workspace administrator to publish this form.
        </p>
      </div>
    );
  }

  // Setup Theme accent data-attribute
  return (
    <div 
      className="light min-h-screen text-slate-900 bg-background flex flex-col transition-all overflow-y-auto"
      data-accent={form.settings.brandColor}
      style={{
        "--primary": 
          form.settings.brandColor === "emerald" ? "oklch(0.60 0.16 170)" :
          form.settings.brandColor === "amber" ? "oklch(0.64 0.18 80)" :
          form.settings.brandColor === "ocean" ? "oklch(0.58 0.16 220)" :
          "oklch(0.58 0.22 280)",
        "--primary-foreground":
          form.settings.brandColor === "emerald" ? "oklch(0.98 0.01 170)" :
          form.settings.brandColor === "amber" ? "oklch(0.99 0.01 80)" :
          form.settings.brandColor === "ocean" ? "oklch(0.98 0.01 220)" :
          "oklch(0.99 0.01 280)"
      } as React.CSSProperties}
    >
      
      {/* LANDING PAGE SITE HEADER (Visible only if enabled) */}
      {form.landingPage.enabled && !submitted && (
        <div className="absolute top-0 left-0 right-0 h-16 px-6 md:px-12 flex items-center justify-between select-none z-30">
          <div className="flex items-center gap-3">
            {form.settings.logoUrl ? (
              <img src={form.settings.logoUrl} alt="Logo" className="h-7 object-contain" />
            ) : (
              <div className="h-7.5 w-7.5 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black border border-primary/20 text-xs">
                {form.title.substring(0,2).toUpperCase()}
              </div>
            )}
            <span className="font-extrabold text-sm text-foreground tracking-tight">{form.title}</span>
          </div>
          <a
            href="#form-card-anchor"
            className="hidden sm:inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider shadow-md shadow-primary/20 hover:scale-105 active:scale-95 duration-200"
          >
            <span>Apply Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* HERO BANNER SECTION (Visible only if landing mode is enabled) */}
      {form.landingPage.enabled && !submitted && (
        <section className="min-h-[70vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 bg-gradient-to-b from-primary/10 to-transparent relative pt-20">
          <div className="max-w-2xl space-y-4">
            <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-block">
              Registration Portal
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-800">
              {form.landingPage.heroTitle}
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed">
              {form.landingPage.heroSubtitle}
            </p>
            <div className="pt-4 flex gap-4 items-center">
              <a
                href="#form-card-anchor"
                className="px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-[1.02] duration-200 flex items-center gap-1.5"
              >
                <span>Complete Application</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* MIDDLE CONTAINER PANEL */}
      <main className={cn(
        "flex-1 flex flex-col justify-center p-6 md:p-12",
        form.landingPage.enabled ? "bg-slate-50/50" : "mesh-gradient"
      )}>
        
        {/* FORM ANCHOR POINT */}
        <div id="form-card-anchor" className="scroll-mt-20 mx-auto w-full max-w-2xl relative">
          
          {/* Cover image (if specified) */}
          {form.settings.coverUrl && !submitted && (
            <div className="w-full h-32 rounded-t-3xl overflow-hidden shadow-sm border border-b-0 border-border/80 relative">
              <img src={form.settings.coverUrl} alt="Cover Banner" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Form container card */}
          <div className={cn(
            "bg-white p-6 md:p-8 border border-border shadow-xl",
            form.settings.coverUrl && !submitted ? "rounded-b-3xl border-t-0" : "rounded-3xl"
          )}>
            
            {/* Logo / Title (Visible on standard form mode or when cover is absent) */}
            {!form.settings.coverUrl && !submitted && (
              <div className="flex flex-col items-center mb-6 text-center select-none">
                {form.settings.logoUrl ? (
                  <img src={form.settings.logoUrl} alt="Logo" className="h-10 object-contain mb-3" />
                ) : (
                  <div className="h-9 w-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-black border border-primary/20 text-xs mb-3">
                    {form.title.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h2 className="text-xl font-black text-slate-800 tracking-tight">{form.title}</h2>
                {form.description && <p className="text-xs text-slate-400 font-semibold mt-1 max-w-xs">{form.description}</p>}
              </div>
            )}

            {/* THANK YOU SUBMISSION SUCCESS VIEW */}
            {submitted ? (
              <div className="py-8 text-center space-y-6 select-none animate-fadeIn">
                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 mx-auto">
                  <CheckCircle2 className="h-8 w-8 fill-emerald-500 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {form.settings.thankYouTitle || "Application Submitted!"}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed whitespace-pre-wrap">
                    {form.settings.thankYouMessage || "Your submission was logged successfully."}
                  </p>
                </div>

                {/* Application tracking card — only when approval workflow is enabled */}
                {trackingId && form.settings.requiresApproval === true && (
                  <div className="p-4 bg-slate-50 border border-border/80 rounded-2xl max-w-xs mx-auto space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Your Tracking ID</span>
                    <div className="text-base font-mono font-black text-slate-800 tracking-tight">{trackingId}</div>
                    <span className="text-[8px] font-semibold text-slate-400 leading-normal block">
                      Save this tracking ID. You can enter it on the Status Tracker to monitor timeline progress.
                    </span>
                    <button
                      onClick={() => router.push(`/${company}/${slug}/status?id=${trackingId}`)}
                      className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider cursor-pointer duration-200"
                    >
                      Track Progress Status
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ACTIVE FORM INPUT FIELD GROUPS */
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Fields list */}
                <div className="space-y-5">
                  {form.fields.map((field) => (
                    <FormFieldInput
                      key={field.id}
                      field={field}
                      value={answers[field.id]}
                      onChange={handleInputChange}
                      onCheckboxChange={handleCheckboxChange}
                      onFileUpload={handleFileUpload}
                      uploadingFieldId={uploadingFieldId}
                      fileUploadNote={fileUploadNotes[field.id]}
                    />
                  ))}
                </div>

                {/* Submit button row */}
                <div className="flex justify-end pt-4 select-none">
                  <button
                    type="submit"
                    disabled={submitting || !validateForm()}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/25 hover:scale-[1.01] duration-200"
                  >
                    <span>{submitting ? "Submitting..." : "Submit Response"}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>

      </main>

      {/* FAQ COLLAPSIBLE SECTIONS (Landing Mode only) */}
      {form.landingPage.enabled && form.landingPage.faqs?.length > 0 && !submitted && (
        <section className="bg-slate-50 border-t border-border/40 py-16 px-6 md:px-12 flex justify-center select-none">
          <div className="w-full max-w-[620px] space-y-8">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-400 font-semibold">Answers to common admissions inquiries</p>
            </div>
            
            <div className="space-y-4">
              {form.landingPage.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-white rounded-2xl border border-border/80 shadow-xs space-y-2">
                  <h4 className="text-xs font-black text-slate-800 flex gap-2 items-center">
                    <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                    <span>{faq.question}</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed pl-6">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER SECTION */}
      {form.landingPage.enabled && (form.landingPage.contactEmail || form.landingPage.contactPhone) && !submitted && (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-white/[0.03] select-none text-xs font-semibold">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Contact Administration</h4>
            
            <div className="flex justify-center gap-8 text-[11px] font-bold">
              {form.landingPage.contactEmail && (
                <a href={`mailto:${form.landingPage.contactEmail}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4.5 w-4.5 text-primary" />
                  <span>{form.landingPage.contactEmail}</span>
                </a>
              )}
              {form.landingPage.contactPhone && (
                <a href={`tel:${form.landingPage.contactPhone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-4.5 w-4.5 text-primary" />
                  <span>{form.landingPage.contactPhone}</span>
                </a>
              )}
            </div>
            <p className="text-[10px] text-slate-600 font-bold">
              © 2026 ANSH Forms. Hosted securely within the ANSH Apps Ecosystem.
            </p>
          </div>
        </footer>
      )}

    </div>
  );
}
