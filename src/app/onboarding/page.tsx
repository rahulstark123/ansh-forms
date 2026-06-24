"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUIStore } from "@/stores/ui-store";
import { supabase } from "@/lib/supabase";
import { ArrowRight, Check, Briefcase, Building, FileText, Globe, AlertTriangle, User, Mail, ChevronDown } from "lucide-react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { FORM_TEMPLATES } from "@/config/templates";

export default function OnboardingPage() {
  const router = useRouter();
  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);

  // Wizard active step (1, 2, or 3)
  const [step, setStep] = useState(1);

  // Loading / Error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [jobTitle, setJobTitle] = useState("Product Manager");
  const [department, setDepartment] = useState("Product");

  const [workspaceName, setWorkspaceName] = useState("");
  const [accent, setAccent] = useState("emerald");
  const [industry, setIndustry] = useState("Software");

  const [firstFormTitle, setFirstFormTitle] = useState("Customer Feedback Survey");
  const [firstFormTemplate, setFirstFormTemplate] = useState("feedback"); // Default template key

  // Initialize fields from current user store
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      if (user.name) {
        setWorkspaceName(`${user.name}'s Workspace`);
      }
    }
  }, [user]);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (step === 1) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (!phone) {
        setError("Please enter your phone number.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!workspaceName.trim()) {
        setError("Please specify your workspace name.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstFormTitle.trim()) {
      setError("Please specify a form title.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers,
        body: JSON.stringify({
          phone,
          jobTitle,
          department,
          workspaceName,
          accent,
          firstFormTitle,
          firstFormTemplate,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to complete onboarding. Please try again.");
      }

      const data = await res.json();
      
      // Update store user state
      setUser(data.user);

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="dark bg-[#030308] text-zinc-150 min-h-screen relative flex font-sans overflow-hidden">
      {/* Ambient background glowing elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed inset-0 landing-grid-bg pointer-events-none opacity-20" />

      {/* Left Pane - Wizard Sidebar Checklist (Dark background, big font styles) */}
      <div className="w-[440px] hidden lg:flex flex-col justify-between p-12 bg-zinc-950 border-r border-white/[0.04] relative z-10 select-none">
        
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 flex items-center justify-center overflow-hidden">
            <Image
              src="/logoAnshapps.png"
              alt="Ansh Apps Logo"
              width={42}
              height={42}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <span className="font-black text-2xl tracking-tight text-white uppercase">
            ANSH FORMS
          </span>
        </div>

        {/* Dynamic step labels and instructions (Enlarged) */}
        <div className="space-y-8 my-auto max-w-sm pr-2">
          <div className="space-y-3">
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase inline-block">
              Step {step} of 3 - Setup Wizard
            </span>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-white">
              {step === 1 && "Customize your profile details"}
              {step === 2 && "Configure your workspace branding"}
              {step === 3 && "Seed your first collaborative form"}
            </h1>
            <p className="text-sm text-zinc-400 font-semibold leading-relaxed mt-2">
              {step === 1 && "Customize your contact details, select your role, and organize your professional department."}
              {step === 2 && "Name your custom team workspace and pick an accent styling theme for dashboard branding."}
              {step === 3 && "Initialize your database with your first active form, generated using pre-seeded template canvases."}
            </p>
          </div>

          {/* Stepper Checklist */}
          <div className="space-y-5 pt-6 border-t border-white/[0.05]">
            <div className="flex items-center gap-4">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-black ${
                step > 1
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : step === 1
                    ? "bg-white text-black border-white"
                    : "border-zinc-700 text-zinc-500"
              }`}>
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </span>
              <span className={`text-sm font-bold ${step === 1 ? "text-white" : "text-zinc-500"}`}>
                Personal profile details
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-black ${
                step > 2
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                  : step === 2
                    ? "bg-white text-black border-white"
                    : "border-zinc-700 text-zinc-500"
              }`}>
                {step > 2 ? <Check className="h-4 w-4" /> : "2"}
              </span>
              <span className={`text-sm font-bold ${step === 2 ? "text-white" : "text-zinc-500"}`}>
                Workspace name & accent
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-black ${
                step === 3
                  ? "bg-white text-black border-white"
                  : "border-zinc-700 text-zinc-500"
              }`}>
                3
              </span>
              <span className={`text-sm font-bold ${step === 3 ? "text-white" : "text-zinc-500"}`}>
                First collaborative form
              </span>
            </div>
          </div>
        </div>

        {/* Setup footer text */}
        <div className="text-[11px] text-zinc-500 font-bold tracking-wide">
          © {new Date().getFullYear()} ANSH APPS. All rights reserved.
        </div>
      </div>

      {/* Right Pane - Form Details Card (White background, light theme inputs, correctly aligned icons) */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 z-10 overflow-y-auto bg-white text-zinc-900 min-h-screen relative">
        <div className="w-full max-w-[480px] bg-white border border-zinc-200 p-8 md:p-10 rounded-3xl shadow-xl relative">
          
          {/* Form Header */}
          <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-none">
                {step === 1 && "Create your profile"}
                {step === 2 && "Customize workspace settings"}
                {step === 3 && "Initialize your first form"}
              </h2>
              <p className="text-[11px] text-zinc-500 font-semibold mt-1">
                {step === 1 && "Enter your name and details so team members can recognize you."}
                {step === 2 && "Branding details will decorate all forms you share publically."}
                {step === 3 && "Pick a layout template style to instantly seed database records."}
              </p>
            </div>
          </div>

          {/* Show Errors */}
          {error && (
            <div className="p-3 mb-5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 flex gap-2 items-center">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1 FORM */}
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Test Name"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full pl-11 pr-24 py-2.5 rounded-xl bg-zinc-100 border border-zinc-200 text-sm font-semibold text-zinc-500 outline-none cursor-not-allowed"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 select-none">
                    <Check className="h-2.5 w-2.5" />
                    Verified
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                {/* Clean light theme wrapper for react-phone-number-input */}
                <div className="w-full flex items-center pl-3 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus-within:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all focus-within:bg-white">
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={phone}
                    onChange={setPhone}
                    placeholder="Enter phone number"
                    className="w-full text-xs"
                    numberInputProps={{
                      className: "w-full bg-transparent border-none outline-none text-sm font-semibold text-zinc-900 pl-2 placeholder:text-zinc-400"
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-550 uppercase tracking-widest block">
                    Your Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                    <select
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="Founder">Founder</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="Developer">Developer</option>
                      <option value="Designer">Designer</option>
                      <option value="Marketer">Marketer</option>
                      <option value="HR Manager">HR Manager</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-550 uppercase tracking-widest block">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="Executive">Executive</option>
                      <option value="Product">Product</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Marketing">Marketing</option>
                      <option value="HR">HR</option>
                      <option value="Support">Support</option>
                      <option value="Other">Other</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-3 bg-zinc-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2 FORM */}
          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Workspace Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    placeholder="e.g. My Organization Workspace"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Workspace Industry
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full pl-11 pr-10 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="Software">Software &amp; IT</option>
                    <option value="E-Commerce">E-Commerce / Retail</option>
                    <option value="Education">Education</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance / Real Estate</option>
                    <option value="Non-profit">Non-profit</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                </div>
              </div>

              {/* Accent Color Picker Box */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Workspace Accent Theme
                </label>
                <div className="grid grid-cols-5 gap-2 select-none pt-1">
                  {[
                    { id: "emerald", class: "bg-emerald-500 border-emerald-400" },
                    { id: "amber", class: "bg-amber-500 border-amber-400" },
                    { id: "ocean", class: "bg-sky-500 border-sky-400" },
                    { id: "purple", class: "bg-purple-500 border-purple-400" },
                    { id: "indigo", class: "bg-indigo-500 border-indigo-400" },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setAccent(color.id)}
                      className={`h-11 rounded-xl border flex items-center justify-center cursor-pointer transition-all duration-300 relative ${color.class} ${
                        accent === color.id
                          ? "ring-4 ring-zinc-500/10 scale-[1.05] border-zinc-900"
                          : "opacity-80 hover:opacity-100 hover:scale-[1.02]"
                      }`}
                    >
                      {accent === color.id && <Check className="h-4.5 w-4.5 text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="px-5 py-3 bg-zinc-900 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 3 FORM */}
          {step === 3 && (
            <form onSubmit={handleCompleteSetup} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  First Form Title
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={firstFormTitle}
                    onChange={(e) => setFirstFormTitle(e.target.value)}
                    placeholder="e.g. Student Registration / Job Application"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Template cards lists */}
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Starter Template
                </label>
                <div className="grid grid-cols-2 gap-3 pt-1 select-none">
                  {[
                    { id: "blank", name: "Blank Canvas", desc: "Start completely empty with standard contact elements." },
                    { id: "feedback", name: "User Feedback", desc: "Includes ratings, support textareas, and slider forms." },
                    { id: "application", name: "Job Application", desc: "Includes portfolio URLs, resume attachment, and text inputs." },
                    { id: "contact", name: "Simple Contact Us", desc: "Includes simple name, emails, organization and messages." },
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setFirstFormTemplate(tpl.id)}
                      className={`text-left p-4 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                        firstFormTemplate === tpl.id
                          ? "bg-zinc-50 border-zinc-800 scale-[1.01] shadow-sm"
                          : "bg-zinc-50/50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-150/40"
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-black text-zinc-800">{tpl.name}</div>
                        <p className="text-[9px] text-zinc-500 leading-snug mt-1 font-semibold line-clamp-2">
                          {tpl.desc}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="px-5 py-3 border border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-800 font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-indigo-500 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:scale-[1.01] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {loading ? (
                    <>
                      <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
