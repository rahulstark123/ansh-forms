"use client";

import React from "react";
import { Portal } from "@/components/ui/portal";
import { X, Crown, Sparkles, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UpgradeLimitModal({ isOpen, onClose }: UpgradeLimitModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgradeRedirect = () => {
    onClose();
    router.push("/pricing");
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm transition-all duration-200">
        <div 
          className="relative w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-6 overflow-hidden flex flex-col transition-all transform scale-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top ambient glow */}
          <div className="absolute -top-12 -left-12 w-40 h-40 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>

          {/* Icon / Header */}
          <div className="flex flex-col items-center text-center mt-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-sm mb-4">
              <Crown className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-none">
              Upgrade to Professional Suite
            </h3>
            <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed font-medium">
              You've reached the limit of <span className="font-bold text-zinc-850 dark:text-zinc-200">5 forms</span> on the Free Plan. Upgrade to Pro to unlock unlimited forms and workspace tools.
            </p>
          </div>

          {/* Plan benefits summary */}
          <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-zinc-900/35 border border-zinc-100 dark:border-zinc-850/60 space-y-2.5">
            {[
              "Unlimited Forms & Response Ops",
              "Advanced AI Form Builder & Auto-Drafting",
              "Custom Branding & Header / Cover options",
              "Detailed Submission Analytics & Exporting",
            ].map((feature) => (
              <div key={feature} className="flex items-start gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                <Check className="h-4 w-4 text-emerald-555 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer text-center"
            >
              Maybe Later
            </button>
            <button
              onClick={handleUpgradeRedirect}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20"
            >
              <Sparkles className="h-4 w-4 shrink-0" />
              <span>See Pricing</span>
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
