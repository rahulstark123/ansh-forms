"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, HelpCircle, XCircle, Mail, Phone } from "lucide-react";
import { FormFieldInput } from "@/components/forms/form-field-input";
import { isDisplayOnlyField } from "@/config/form-fields";
import { uploadFileWithCompression } from "@/lib/upload-file";
import { compressionSummary } from "@/lib/compress-file";
import { MsmeBadge } from "@/components/shared/msme-badge";

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
  fields: FormField[];
  settings?: {
    requiresApproval?: boolean;
  };
}

interface LandingPageDetails {
  id: string;
  title: string;
  description: string;
  slug: string;
  landingPage: {
    heroTitle: string;
    heroSubtitle: string;
    connectedFormSlug: string;
    faqs: { question: string; answer: string }[];
    contactEmail: string;
    contactPhone: string;
  };
  settings: {
    brandColor: string;
    logoUrl?: string;
    coverUrl?: string;
    thankYouTitle: string;
    thankYouMessage: string;
  };
}

export default function PublicLandingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // States
  const [lp, setLp] = useState<LandingPageDetails | null>(null);
  const [connectedForm, setConnectedForm] = useState<FormDetails | null>(null);
  const [connectedFormCompanySlug, setConnectedFormCompanySlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form Submission States
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [fileUploadNotes, setFileUploadNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchLandingPageDetails();
  }, [slug]);

  const fetchLandingPageDetails = async () => {
    try {
      // 1. Fetch landing page record
      const lpRes = await fetch(`/api/forms/public?slug=${slug}`);
      if (!lpRes.ok) {
        setError("Landing Page not found.");
        setLoading(false);
        return;
      }
      
      const lpData = await lpRes.json();
      const lpSettings = typeof lpData.form.settings === "string" ? JSON.parse(lpData.form.settings) : lpData.form.settings || {};
      
      if (!lpSettings.isLandingPage) {
        setError("This URL points to a form, not a landing page portal.");
        setLoading(false);
        return;
      }

      const lpLp = typeof lpData.form.landingPage === "string" ? JSON.parse(lpData.form.landingPage) : lpData.form.landingPage || {};
      
      const lpDetails: LandingPageDetails = {
        id: lpData.form.id,
        title: lpData.form.title,
        description: lpData.form.description,
        slug: lpData.form.slug,
        landingPage: {
          heroTitle: lpData.form.title,
          heroSubtitle: lpData.form.description || "",
          connectedFormSlug: "",
          faqs: [],
          contactEmail: "",
          contactPhone: "",
          ...lpLp
        },
        settings: {
          brandColor: "emerald",
          thankYouTitle: "Thank You!",
          thankYouMessage: "Your submission has been recorded.",
          ...lpSettings
        }
      };

      setLp(lpDetails);
      incrementViews(lpDetails.id);

      // 2. Fetch connected form details if slug exists
      const formSlug = lpDetails.landingPage.connectedFormSlug;
      if (formSlug) {
        const formRes = await fetch(`/api/forms/public?slug=${formSlug}`);
        if (formRes.ok) {
          const formData = await formRes.json();
          const parsedFields = typeof formData.form.fields === "string" ? JSON.parse(formData.form.fields) : formData.form.fields || [];
          const formSettings = typeof formData.form.settings === "string" ? JSON.parse(formData.form.settings) : formData.form.settings || {};
          setConnectedForm({
            id: formData.form.id,
            title: formData.form.title,
            fields: parsedFields,
            settings: formSettings,
          });
          setConnectedFormCompanySlug(formData.workspaceSlug || "");
        }
      }
    } catch (err) {
      console.error("Error loading public landing page:", err);
      setError("Failed to resolve public landing page link.");
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (formId: string) => {
    try {
      await fetch(`/api/forms/public/views`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId })
      });
    } catch (e) {
      // Ignore
    }
  };



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

  const validateForm = () => {
    if (!connectedForm) return false;
    for (const field of connectedForm.fields) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lp || !connectedForm || !validateForm()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/forms/${connectedForm.id}/submit`, {
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
        <span className="text-xs font-black tracking-widest uppercase text-slate-500">Loading Landing Page</span>
      </div>
    );
  }

  if (error || !lp) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#070913] text-zinc-100 p-6 select-none">
        <div className="h-14 w-14 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20 mb-4">
          <XCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-black tracking-tight">{error || "Access Denied"}</h3>
        <p className="text-xs text-slate-500 mt-1.5 max-w-xs text-center font-semibold leading-relaxed">
          Please verify your URL slug or contact the administrator to publish this page.
        </p>
      </div>
    );
  }

  const brandColor = lp.settings.brandColor || "emerald";

  return (
    <div 
      className="light min-h-screen text-slate-900 bg-background flex flex-col transition-all overflow-y-auto"
      data-accent={brandColor}
      style={{
        "--primary": 
          brandColor === "emerald" ? "oklch(0.60 0.16 170)" :
          brandColor === "amber" ? "oklch(0.64 0.18 80)" :
          brandColor === "ocean" ? "oklch(0.58 0.16 220)" :
          "oklch(0.58 0.22 280)",
        "--primary-foreground":
          brandColor === "emerald" ? "oklch(0.98 0.01 170)" :
          brandColor === "amber" ? "oklch(0.99 0.01 80)" :
          brandColor === "ocean" ? "oklch(0.98 0.01 220)" :
          "oklch(0.99 0.01 280)"
      } as React.CSSProperties}
    >
      {/* Site Header */}
      {!submitted && (
        <div className="absolute top-0 left-0 right-0 h-16 px-6 md:px-12 flex items-center justify-between select-none z-30 bg-white/50 backdrop-blur-xs border-b border-border/10">
          <div className="flex items-center gap-3">
            {lp.settings.logoUrl ? (
              <img src={lp.settings.logoUrl} alt="Logo" className="h-7 object-contain" />
            ) : (
              <div className="h-7.5 w-7.5 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-black border border-primary/20 text-xs">
                {lp.title.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-extrabold text-sm text-foreground tracking-tight">{lp.title}</span>
          </div>
          <a
            href="#lp-form-section"
            className="hidden sm:inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-primary text-primary-foreground font-black text-[10px] uppercase tracking-wider shadow-md hover:scale-105 duration-200"
          >
            <span>Register Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {/* Hero Section */}
      {!submitted && (
        <section className="min-h-[65vh] flex flex-col justify-center px-6 md:px-16 lg:px-24 bg-gradient-to-b from-primary/10 to-transparent relative pt-20">
          {lp.settings.coverUrl && (
            <div className="absolute inset-0 z-0 opacity-10 bg-center bg-cover" style={{ backgroundImage: `url(${lp.settings.coverUrl})` }} />
          )}
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-block">
              Connected Portal
            </span>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-slate-800">
              {lp.landingPage.heroTitle}
            </h1>
            <p className="text-sm md:text-base text-slate-500 font-semibold leading-relaxed">
              {lp.landingPage.heroSubtitle}
            </p>
            <div className="pt-4">
              <a
                href="#lp-form-section"
                className="px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider shadow-lg hover:scale-[1.02] duration-200 inline-flex items-center gap-1.5"
              >
                <span>Proceed to Form</span>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Form Section */}
      <main className="flex-1 flex flex-col justify-center p-6 md:p-12 bg-slate-50/50">
        <div id="lp-form-section" className="scroll-mt-20 mx-auto w-full max-w-2xl relative">
          <div className="bg-white p-6 md:p-8 border border-border shadow-xl rounded-3xl">
            {submitted ? (
              <div className="py-8 text-center space-y-6 select-none animate-fadeIn">
                <div className="h-16 w-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 mx-auto">
                  <CheckCircle2 className="h-8 w-8 fill-emerald-500 text-white" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    {lp.settings.thankYouTitle || "Submission Successful!"}
                  </h2>
                  <p className="text-xs text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
                    {lp.settings.thankYouMessage || "Your submission was logged successfully."}
                  </p>
                </div>

                {trackingId && connectedForm?.settings?.requiresApproval === true && (
                  <div className="p-4 bg-slate-50 border border-border/85 rounded-2xl max-w-xs mx-auto space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Reference ID</span>
                    <div className="text-base font-mono font-black text-slate-800 tracking-tight">{trackingId}</div>
                    <span className="text-[8px] font-semibold text-slate-400 leading-normal block">
                      Save this ID. You can enter it on the Status page to check workflow updates.
                    </span>
                    <button
                      onClick={() =>
                        router.push(
                          `/${connectedFormCompanySlug}/${lp.landingPage.connectedFormSlug}/status?id=${trackingId}`,
                        )
                      }
                      className="w-full mt-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-[10px] uppercase tracking-wider cursor-pointer duration-200"
                    >
                      Track Progress Status
                    </button>
                  </div>
                )}
              </div>
            ) : !connectedForm ? (
              <div className="py-8 text-center text-xs font-bold text-slate-400 select-none">
                No active form connected to this landing page.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center select-none mb-4">
                  <span className="text-[10px] font-black uppercase text-primary tracking-widest">Connect Form</span>
                  <h2 className="text-base font-black text-slate-800 tracking-tight mt-1">{connectedForm.title}</h2>
                </div>

                <div className="space-y-5">
                  {connectedForm.fields.map((field) => (
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

                <div className="flex justify-end pt-4 select-none">
                  <button
                    type="submit"
                    disabled={submitting || !validateForm()}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center gap-1.5 shadow-md shadow-primary/25 hover:scale-[1.01] duration-200"
                  >
                    <span>{submitting ? "Submitting..." : "Submit Application"}</span>
                    <ArrowRight className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* FAQ Accordion Section */}
      {!submitted && lp.landingPage.faqs?.length > 0 && (
        <section className="bg-slate-50 border-t border-border/40 py-16 px-6 md:px-12 flex justify-center select-none">
          <div className="w-full max-w-[620px] space-y-8">
            <div className="text-center space-y-1.5">
              <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">Frequently Asked Questions</h2>
              <p className="text-xs text-slate-400 font-semibold">Answers to common admissions inquiries</p>
            </div>
            
            <div className="space-y-4">
              {lp.landingPage.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 bg-white rounded-2xl border border-border/85 shadow-xs space-y-2">
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

      {/* Footer Section */}
      {!submitted && (lp.landingPage.contactEmail || lp.landingPage.contactPhone) && (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-white/[0.03] select-none text-xs font-semibold">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Contact Details</h4>
            
            <div className="flex justify-center gap-8 text-[11px] font-bold">
              {lp.landingPage.contactEmail && (
                <a href={`mailto:${lp.landingPage.contactEmail}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail className="h-4.5 w-4.5 text-primary" />
                  <span>{lp.landingPage.contactEmail}</span>
                </a>
              )}
              {lp.landingPage.contactPhone && (
                <a href={`tel:${lp.landingPage.contactPhone}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone className="h-4.5 w-4.5 text-primary" />
                  <span>{lp.landingPage.contactPhone}</span>
                </a>
              )}
            </div>
            <div className="flex flex-col items-center gap-3 pt-2">
              <MsmeBadge />
              <p className="text-[10px] text-slate-600 font-bold">
                © 2026 ANSH Forms. Hosted securely within the ANSH Apps Ecosystem.
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
