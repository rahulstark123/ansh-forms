"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useUIStore } from "@/stores/ui-store";
import { supabase } from "@/lib/supabase";
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, Bot, Compass, BarChart3, Clock, User, Check, X, ShieldAlert } from "lucide-react";

const GoogleIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const CAROUSEL_SLIDES = [
  {
    title: "AI Form Builder",
    tagline: "Describe it. Generate it.",
    description: "Write down your prompt and automatically compile ready-to-use form definitions in seconds.",
    icon: Bot,
    badge: "AI Engine",
    renderMockup: () => (
      <div className="border border-white/[0.04] bg-white/[0.02] p-5 rounded-2xl space-y-3.5 select-none animate-fadeIn duration-500 backdrop-blur-md">
        <div className="flex justify-between items-center text-[10px] font-black text-emerald-400 uppercase tracking-widest">
          <span>AI Form Prompt</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="text-xs bg-zinc-900/60 p-2.5 rounded-xl border border-white/[0.05] text-zinc-300 font-mono italic">
          "Create a school admission form"
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.03]">
            <span className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[9px]">1</span>
            <span>Parent Contact Details</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-400 bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/[0.03]">
            <span className="h-4 w-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-[9px]">2</span>
            <span>Student DOB & Previous Grade</span>
          </div>
        </div>
      </div>
    )
  },
  {
    title: "Landing Pages USP",
    tagline: "Forms Into Websites",
    description: "Every form automatically spawns an optimized landing page with hero header, FAQs list, and footer contact cards.",
    icon: Compass,
    badge: "CMS Publishing",
    renderMockup: () => (
      <div className="border border-white/[0.04] bg-white/[0.02] p-5 rounded-2xl space-y-3.5 select-none animate-fadeIn duration-500 backdrop-blur-md">
        <div className="flex justify-between items-center text-[10px] font-black text-sky-400 uppercase tracking-widest">
          <span>Live URL Preview</span>
          <span className="text-[9px] bg-sky-500/10 text-sky-400 px-1.5 py-0.5 rounded border border-sky-500/15">Active Website</span>
        </div>
        <div className="space-y-1">
          <div className="text-xs font-black text-zinc-100">Admission Open 2026 🎒</div>
          <div className="text-[9px] text-zinc-500">Apply online for early childhood programs</div>
        </div>
        <div className="h-[2px] bg-gradient-to-r from-sky-500 to-transparent w-full" />
        <div className="flex gap-2 text-[9px]">
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.05]">Hero Header</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.05]">FAQs Section</span>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.05]">Form Card</span>
        </div>
      </div>
    )
  },
  {
    title: "Submissions Analytics",
    tagline: "Conversion Rates Tracker",
    description: "Map out weekly responses, chart rating selections, and export full records to Excel or CSV formats.",
    icon: BarChart3,
    badge: "Data Console",
    renderMockup: () => (
      <div className="border border-white/[0.04] bg-white/[0.02] p-5 rounded-2xl space-y-3 select-none animate-fadeIn duration-500 backdrop-blur-md">
        <div className="flex justify-between items-center text-[10px] font-black text-amber-400 uppercase tracking-widest">
          <span>Submissions Summary</span>
          <span>Conversion: 16.4%</span>
        </div>
        <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
          {[20, 45, 30, 80, 55, 95, 70].map((h, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-1">
              <div 
                className="w-full bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 rounded-t transition-all duration-300"
                style={{ height: `${h}%` }}
              />
              <span className="text-[8px] font-bold text-zinc-500">{['M','T','W','T','F','S','S'][i]}</span>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    title: "Tracking status",
    tagline: "Bharat-friendly Application CRM",
    description: "Assign timeline progress labels (Submitted -> Review -> Final Status). Users query status via reference code.",
    icon: Clock,
    badge: "CRM Statuses",
    renderMockup: () => (
      <div className="border border-white/[0.04] bg-white/[0.02] p-5 rounded-2xl space-y-3 select-none animate-fadeIn duration-500 backdrop-blur-md">
        <div className="flex justify-between items-center text-[10px] font-black text-purple-400 uppercase tracking-widest">
          <span>Tracking ID: ANSH-48192</span>
          <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/15">Under Review</span>
        </div>
        <div className="relative pl-6 space-y-2 text-[10px]">
          <div className="absolute left-1.5 top-1 bottom-1 w-[1px] bg-purple-500/30" />
          <div className="relative">
            <span className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-emerald-500 border border-emerald-400" />
            <div className="font-bold text-zinc-200">Form Submitted Successfully</div>
            <div className="text-[8px] text-zinc-500">June 23, 2026</div>
          </div>
          <div className="relative">
            <span className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-purple-500 border border-purple-400 animate-ping" />
            <span className="absolute -left-[21px] top-0.5 h-2 w-2 rounded-full bg-purple-500 border border-purple-400" />
            <div className="font-bold text-zinc-200">Documents Under Verification</div>
            <div className="text-[8px] text-zinc-500">Processing logs...</div>
          </div>
        </div>
      </div>
    )
  }
];

export default function LoginPage({ initialIsSignUp = false }: { initialIsSignUp?: boolean }) {
  const router = useRouter();
  const setUser = useUIStore((state) => state.setUser);

  // Authentication Switch State
  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("signup") === "true") {
        setIsSignUp(true);
      }
    }
  }, []);

  // Form Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password Requirements (for Sign Up)
  const [hasMinLength, setHasMinLength] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  
  // Validation / Loading States
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Carousel Active Slide State
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto rotate slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Update password requirement flags as user types
  useEffect(() => {
    setHasMinLength(password.length >= 8);
    setHasNumber(/\d/.test(password));
    setHasUppercase(/[A-Z]/.test(password));
    setHasSpecialChar(/[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password));
  }, [password]);

  const isPasswordStrong = hasMinLength && hasNumber && hasUppercase && hasSpecialChar;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isSignUp) {
      handleSignUpSubmit();
    } else {
      handleSignInSubmit();
    }
  };

  const handleSignInSubmit = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.user.email,
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User"
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Failed to sync profile. Please try again.");
          setIsLoading(false);
          return;
        }

        const syncData = await res.json();
        setUser(syncData.user);

        if (syncData.user.hasCompletedOnboarding === false) {
          router.push("/onboarding");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during sign in.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!isPasswordStrong) {
      setError("Please ensure your password meets all strength criteria.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          setError(errData.error || "Failed to register profile. Please try again.");
          setIsLoading(false);
          return;
        }

        const syncData = await res.json();
        setUser(syncData.user);
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (authError) {
        setError(authError.message);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Google auth error.");
      setIsGoogleLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setError("");
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="dark bg-[#030308] text-zinc-100 min-h-screen relative flex font-sans overflow-hidden">
      {/* Ambient background glowing orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed inset-0 landing-grid-bg pointer-events-none opacity-20" />

      {/* Left side: Premium Showcase Carousel */}
      <div className="w-1/2 hidden lg:flex flex-col justify-between p-16 bg-zinc-950/80 border-r border-white/[0.04] relative z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Brand header */}
        <div className="flex items-center gap-3 select-none">
          <div className="h-14 w-14 flex items-center justify-center overflow-hidden">
            <Image
              src="/logoAnshapps.png"
              alt="Ansh Apps Logo"
              width={52}
              height={52}
              className="h-12 w-12 object-contain"
              priority
            />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">
            ANSH Forms
          </span>
        </div>

        {/* Carousel Content Area */}
        <div className="space-y-8 my-auto relative z-10 max-w-sm">
          <div className="space-y-3.5">
            <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-block">
              {CAROUSEL_SLIDES[activeSlide].badge}
            </span>
            <h1 className="text-3xl font-black tracking-tight leading-tight text-white min-h-[72px] flex items-start gap-2.5">
              <div>
                {CAROUSEL_SLIDES[activeSlide].title} <br />
                <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-indigo-500 bg-clip-text text-transparent">
                  {CAROUSEL_SLIDES[activeSlide].tagline}
                </span>
              </div>
            </h1>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed min-h-[48px]">
              {CAROUSEL_SLIDES[activeSlide].description}
            </p>
          </div>

          {/* Active slide mockup renderer */}
          <div className="min-h-[160px] flex flex-col justify-center">
            {CAROUSEL_SLIDES[activeSlide].renderMockup()}
          </div>
        </div>

        {/* Carousel indicator dots */}
        <div className="flex items-center gap-2 select-none z-20">
          {CAROUSEL_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                activeSlide === idx ? "w-6 bg-primary" : "w-2 bg-zinc-700 hover:bg-zinc-500"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right side: Forms Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-16 relative z-10 overflow-y-auto bg-white text-zinc-900 min-h-screen">
        {/* Mobile Header */}
        <div className="flex flex-col items-center mb-6 space-y-2 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 flex items-center justify-center overflow-hidden">
              <Image
                src="/logoAnshapps.png"
                alt="Ansh Apps Logo"
                width={36}
                height={36}
                className="h-8.5 w-8.5 object-contain"
                priority
              />
            </div>
            <span className="font-black text-xl tracking-tight text-zinc-900 select-none">
              ANSH Forms
            </span>
          </div>
        </div>

        <div className="w-full max-w-[380px] space-y-5 animate-fadeIn">
          
          {/* Section title toggles */}
          <div className="space-y-1.5 text-center lg:text-left select-none">
            <h2 className="text-xl xl:text-2xl font-black text-zinc-900 tracking-tight">
              {isSignUp ? "Create Your Account" : "Welcome Back"}
            </h2>
            <p className="text-xs text-zinc-500 font-semibold">
              {isSignUp 
                ? "Register details to secure your forms builder workspace." 
                : "Enter credentials to access your forms dashboard."}
            </p>
          </div>

          {/* Social login option */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-2.5 rounded-xl bg-white border border-zinc-200 hover:bg-zinc-50 text-xs font-bold uppercase tracking-wider text-zinc-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-sm hover:shadow"
          >
            {isGoogleLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-zinc-400 border-t-zinc-700 rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <>
                <GoogleIcon />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-wider text-zinc-400 select-none">
            <div className="h-[1px] bg-zinc-200 flex-1" />
            <span>or continue with email</span>
            <div className="h-[1px] bg-zinc-200 flex-1" />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 flex gap-2 items-center animate-fadeInDown">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            
            {/* 1. Name Field (Only on Sign Up) */}
            {isSignUp && (
              <div className="space-y-1 animate-fadeInDown">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ansh Sharma"
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white animate-fadeIn"
                    required
                  />
                </div>
              </div>
            )}

            {/* 2. Email field */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* 3. Password field */}
            <div className="space-y-1">
              <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {!isSignUp && (
                <div className="flex justify-end pt-1">
                  <a href="#" className="text-[9px] font-black text-emerald-600 hover:text-emerald-500 uppercase tracking-widest transition-colors">
                    Forgot Password?
                  </a>
                </div>
              )}
            </div>

            {/* 3b. Confirm Password field (Only on Sign Up) */}
            {isSignUp && (
              <div className="space-y-1 animate-fadeInDown">
                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 focus:border-primary/50 text-sm font-semibold text-zinc-900 outline-none transition-all placeholder:text-zinc-400 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* 4. Password Criteria indicator list (Only on Sign Up when password is entered) */}
            {isSignUp && password.length > 0 && (
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 space-y-1.5 animate-fadeInDown">
                <div className="text-[8px] font-black text-zinc-450 uppercase tracking-wider">
                  Password Strength Requirements:
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                  <div className="flex items-center gap-1.5">
                    {hasMinLength ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                    )}
                    <span className={hasMinLength ? "text-emerald-600 animate-fadeIn" : "text-zinc-450"}>
                      Min 8 Characters
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasNumber ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                    )}
                    <span className={hasNumber ? "text-emerald-600 animate-fadeIn" : "text-zinc-450"}>
                      Contains Number
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasUppercase ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                    )}
                    <span className={hasUppercase ? "text-emerald-600 animate-fadeIn" : "text-zinc-450"}>
                      Uppercase Letter
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {hasSpecialChar ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3.5 w-3.5 text-rose-450 shrink-0" />
                    )}
                    <span className={hasSpecialChar ? "text-emerald-600 animate-fadeIn" : "text-zinc-450"}>
                      Special Character
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-indigo-500 hover:from-emerald-500/95 hover:to-indigo-500/95 text-white font-extrabold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 hover:scale-[1.01] duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:pointer-events-none mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  {isSignUp ? "Register Workspace" : "Sign In"} 
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <p className="text-center text-xs text-zinc-500 font-semibold uppercase tracking-wider mt-4">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={toggleAuthMode}
              type="button"
              className="text-emerald-600 hover:text-emerald-500 font-black transition-colors cursor-pointer"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
