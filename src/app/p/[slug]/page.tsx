"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Star, Upload, PenTool, CheckCircle2, ChevronRight, ChevronLeft, Mail, Phone, Clock, ArrowRight, ShieldCheck, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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
  fields: FormField[];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form Submission States
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);

  // Signature States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

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
          setConnectedForm({
            id: formData.form.id,
            title: formData.form.title,
            fields: parsedFields
          });
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
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        handleInputChange(fieldId, data.url);
      }
    } catch (err) {
      console.error("File upload failed:", err);
    } finally {
      setUploadingFieldId(null);
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = ("touches" in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = ("touches" in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const validateForm = () => {
    if (!connectedForm) return false;
    for (const field of connectedForm.fields) {
      if (field.required) {
        const val = answers[field.id];
        if (field.type === "signature" && !hasSignature) return false;
        if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lp || !connectedForm || !validateForm()) return;

    let finalAnswers = { ...answers };
    const signatureField = connectedForm.fields.find((f) => f.type === "signature");
    if (signatureField && canvasRef.current && hasSignature) {
      const signatureDataUrl = canvasRef.current.toDataURL("image/png");
      finalAnswers[signatureField.id] = signatureDataUrl;
    }

    setSubmitting(true);
    try {
      // Submit response to connected form endpoint
      const res = await fetch(`/api/forms/${connectedForm.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: finalAnswers })
      });

      if (res.ok) {
        const data = await res.json();
        setTrackingId(data.submission.customId);
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
      className="min-h-screen text-slate-900 bg-background flex flex-col transition-all overflow-y-auto"
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

                {trackingId && (
                  <div className="p-4 bg-slate-50 border border-border/85 rounded-2xl max-w-xs mx-auto space-y-2">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Reference ID</span>
                    <div className="text-base font-mono font-black text-slate-800 tracking-tight">{trackingId}</div>
                    <span className="text-[8px] font-semibold text-slate-400 leading-normal block">
                      Save this ID. You can enter it on the Status page to check workflow updates.
                    </span>
                    <button
                      onClick={() => router.push(`/f/${lp.landingPage.connectedFormSlug}/status?id=${trackingId}`)}
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
                  {connectedForm.fields.map((field) => {
                    const requiredStar = field.required ? <span className="text-rose-500 font-black">*</span> : null;

                    return (
                      <div key={field.id} className="space-y-1.5 text-left">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                          {field.label} {requiredStar}
                        </label>

                        {field.type === "textarea" ? (
                          <textarea
                            value={answers[field.id] || ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="premium-input text-xs h-24 resize-none"
                            required={field.required}
                          />
                        ) : field.type === "dropdown" ? (
                          <select
                            value={answers[field.id] || ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="premium-input text-xs"
                            required={field.required}
                          >
                            <option value="">{field.placeholder || "Select an option"}</option>
                            {field.options?.map((opt, oIdx) => (
                              <option key={oIdx} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === "radio" ? (
                          <div className="space-y-2 select-none pt-1">
                            {field.options?.map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                                <input
                                  type="radio"
                                  name={field.id}
                                  value={opt}
                                  checked={answers[field.id] === opt}
                                  onChange={() => handleInputChange(field.id, opt)}
                                  className="h-4.5 w-4.5 text-primary border-slate-300 focus:ring-primary/20"
                                  required={field.required && !answers[field.id]}
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : field.type === "checkbox" ? (
                          <div className="space-y-2 select-none pt-1">
                            {field.options?.map((opt, oIdx) => (
                              <label key={oIdx} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
                                <input
                                  type="checkbox"
                                  checked={(answers[field.id] || []).includes(opt)}
                                  onChange={(e) => handleCheckboxChange(field.id, opt, e.target.checked)}
                                  className="rounded border-slate-300 text-primary focus:ring-primary/20 h-4.5 w-4.5"
                                />
                                <span>{opt}</span>
                              </label>
                            ))}
                          </div>
                        ) : field.type === "rating" ? (
                          <div className="flex gap-2 text-slate-300 pt-1 select-none">
                            {[1, 2, 3, 4, 5].map((star) => {
                              const active = star <= (answers[field.id] || 0);
                              return (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => handleInputChange(field.id, star)}
                                  className={cn("hover:scale-110 cursor-pointer duration-200", active ? "text-amber-400" : "text-slate-200")}
                                >
                                  <Star className={cn("h-7 w-7", active && "fill-current")} />
                                </button>
                              );
                            })}
                          </div>
                        ) : field.type === "file" ? (
                          <div className="space-y-2 select-none">
                            {answers[field.id] ? (
                              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs font-bold text-emerald-600">
                                <div className="flex items-center gap-2 truncate">
                                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                                  <span className="truncate">File Uploaded</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleInputChange(field.id, "")}
                                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                                >
                                  Clear
                                </button>
                              </div>
                            ) : (
                              <div className="relative">
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(field.id, e)}
                                  className="hidden"
                                  id={`file_input_${field.id}`}
                                  disabled={uploadingFieldId === field.id}
                                />
                                <label
                                  htmlFor={`file_input_${field.id}`}
                                  className="w-full flex flex-col items-center justify-center py-4 rounded-xl border border-dashed border-border hover:border-primary/50 cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 text-[10px] font-black uppercase text-slate-400 tracking-wider transition-all"
                                >
                                  {uploadingFieldId === field.id ? (
                                    <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-1" />
                                  ) : (
                                    <Upload className="h-5 w-5 mb-1.5 text-slate-450" />
                                  )}
                                  <span>{uploadingFieldId === field.id ? "Uploading file..." : "Choose File Attachment"}</span>
                                </label>
                              </div>
                            )}
                          </div>
                        ) : field.type === "signature" ? (
                          <div className="space-y-2 select-none">
                            <div className="border border-border/80 bg-slate-50/20 rounded-xl overflow-hidden relative">
                              <canvas
                                ref={canvasRef}
                                width={480}
                                height={150}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                                onTouchStart={startDrawing}
                                onTouchMove={draw}
                                onTouchEnd={stopDrawing}
                                className="w-full h-32 block bg-slate-50/50 cursor-crosshair touch-none"
                              />
                              {!hasSignature && (
                                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-400 italic pointer-events-none uppercase tracking-wider">
                                  Draw signature inside canvas
                                </div>
                              )}
                            </div>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={clearSignature}
                                className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest cursor-pointer"
                              >
                                Clear Canvas
                              </button>
                            </div>
                          </div>
                        ) : (
                          <input
                            type={field.type === "phone" ? "text" : field.type}
                            value={answers[field.id] || ""}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder}
                            className="premium-input text-xs"
                            required={field.required}
                          />
                        )}
                      </div>
                    );
                  })}
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
            <p className="text-[10px] text-slate-600 font-bold">
              © 2026 ANSH Forms. Hosted securely within the ANSH Apps Ecosystem.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
