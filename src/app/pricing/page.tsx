"use client";

import React, { useState, useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";
import { Check, ShieldCheck, CreditCard, Sparkles, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PricingPage() {
  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isIndia, setIsIndia] = useState(true);

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setIsIndia(tz === "Asia/Kolkata" || tz === "Asia/Calcutta");
    } catch (e) {
      // fallback
    }
  }, []);

  const handleUpgrade = async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      const res = await fetch("/api/billing/upgrade", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ ...user, pricingPlan: "Pro" });
        setSuccess(true);
      }
    } catch (err) {
      console.error("Upgrade error:", err);
    } finally {
      setUpgrading(false);
    }
  };

  const freeFeatures = [
    "Up to 5 active forms",
    "Unlimited submission answers",
    "Predefined templates (General)",
    "SVG QR Code Generation",
    "Ansh Forms footer watermarks"
  ];

  const proFeatures = [
    "Unlimited forms building",
    "AI Form Generator prompts",
    "Automatic Landing Pages mode",
    "Cloudflare R2 File Uploads",
    "Recharts analytics visualizations",
    "Status Timeline trackers",
    "Custom logo and brand accents",
    "Removes ANSH watermark tags"
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto select-none">
      
      {/* Header pricing details */}
      <div className="text-center space-y-2 select-none">
        <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-block">
          Pricing Configurations
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-none pt-1">
          Bharat-Friendly Pricing Model
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
          Unlock high-performance landing pages, AI prompts generators, and custom logo brand accents.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600 flex gap-2.5 items-start animate-fadeInDown">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-black uppercase tracking-wider text-[10px]">Upgrade Successful!</div>
            <p className="text-slate-500 mt-1 leading-normal font-bold">
              Congratulations! Your workspace has been upgraded to the **PRO Plan**. All limits are removed.
            </p>
          </div>
        </div>
      )}

      {/* PLAN CONTAINER BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* FREE PLAN */}
        <div className="crm-card bg-card border-border/85 p-6 flex flex-col justify-between relative">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Free Starter</span>
            
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-4xl font-black text-slate-800 dark:text-zinc-100">{isIndia ? "₹0" : "$0"}</span>
              <span className="text-xs text-slate-400 font-bold">/ month</span>
            </div>
            
            <p className="text-xs text-slate-400 leading-normal font-medium">
              Perfect for schools, events, and local businesses launching simple forms.
            </p>

            <div className="h-[1px] bg-border/40 my-2" />

            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {freeFeatures.map((feat, i) => (
                <li key={i} className="flex gap-2 items-center">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            <button
              disabled
              className="w-full py-3 rounded-xl border border-border/80 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-zinc-800/10 cursor-not-allowed text-center select-none"
            >
              {user?.pricingPlan === "Free" ? "Your Active Plan" : "Downgrade Offline"}
            </button>
          </div>
        </div>

        {/* PRO PLAN */}
        <div className="crm-card bg-card border-primary p-6 flex flex-col justify-between relative ring-2 ring-primary/10">
          <span className="absolute top-4 right-4 bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase">
            Recommended
          </span>

          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-primary tracking-wider">Professional Suite</span>
            
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-4xl font-black text-slate-800 dark:text-zinc-100">{isIndia ? "₹199" : "$5"}</span>
              <span className="text-xs text-slate-400 font-bold">/ month</span>
            </div>

            <p className="text-xs text-slate-400 leading-normal font-medium">
              Supercharge registrations with custom websites, AI templates generators, and responses status timeliners.
            </p>

            <div className="h-[1px] bg-border/40 my-2" />

            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {proFeatures.map((feat, i) => (
                <li key={i} className="flex gap-2 items-center">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-bold">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6">
            {user?.pricingPlan === "Pro" ? (
              <button
                disabled
                className="w-full py-3 rounded-xl border border-emerald-500/20 text-xs font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 text-center select-none cursor-default"
              >
                PRO Plan Active
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
              >
                <CreditCard className="h-4.5 w-4.5 shrink-0" />
                <span>{upgrading ? "Upgrading Plan..." : "Simulate Checkout Upgrade"}</span>
              </button>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
