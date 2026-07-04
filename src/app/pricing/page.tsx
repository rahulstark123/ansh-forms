"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { Check, ShieldCheck, CreditCard, X, Crown, Sparkles, CalendarClock } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { getProPricing } from "@/lib/pricing";
import { loadRazorpayScript } from "@/lib/razorpay-checkout";
import {
  FREE_PLAN_EXCLUDED,
  FREE_PLAN_INCLUDED,
  PRO_PLAN_FEATURES,
  PRICING_COPY,
} from "@/lib/plan-features";

export default function PricingPage() {
  const router = useRouter();
  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);
  const [upgrading, setUpgrading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIndia, setIsIndia] = useState(true);

  useEffect(() => {
    fetch("/api/geo")
      .then((res) => res.json())
      .then((data) => setIsIndia(!!data.isIndia))
      .catch(() => {
        try {
          const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setIsIndia(tz === "Asia/Kolkata" || tz === "Asia/Calcutta");
        } catch {
          setIsIndia(true);
        }
      });
  }, []);

  const pricing = getProPricing(isIndia);

  // ── Current plan + expiry summary ──────────────────────────────
  const currentPlan = user?.pricingPlan ?? null;
  const isPro = currentPlan === "Pro";
  const isTrial = currentPlan === "Free Trial";
  const trialEnd = user?.trialEndsAt ? new Date(user.trialEndsAt) : null;
  const trialActive = !!trialEnd && trialEnd.getTime() > Date.now();
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((trialEnd.getTime() - Date.now()) / 86_400_000))
    : 0;
  const trialEndLabel = trialEnd
    ? trialEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
    : null;

  const planName = isPro ? "Pro" : isTrial ? "Free Trial" : "Free";
  const planBadge =
    isPro
      ? { text: "Active", cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" }
      : isTrial && trialActive
        ? { text: "Trial", cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" }
        : isTrial && !trialActive
          ? { text: "Expired", cls: "bg-rose-500/10 text-rose-500 border-rose-500/20" }
          : { text: "Active", cls: "bg-slate-500/10 text-slate-500 border-slate-400/25" };
  const expiryLabel = isPro ? "Renewal" : isTrial ? "Trial ends" : "Validity";
  const expiryValue = isPro
    ? "Renews monthly"
    : isTrial
      ? trialActive
        ? `${trialEndLabel} · ${trialDaysLeft} day${trialDaysLeft === 1 ? "" : "s"} left`
        : "Trial expired"
      : "No expiry — free forever";
  const expiryIsAlert = isTrial && !trialActive;

  const handleUpgrade = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setError(null);
    setUpgrading(true);

    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        throw new Error("Unable to load Razorpay checkout. Please try again.");
      }

      const orderRes = await apiClient("/api/billing/razorpay/order", {
        method: "POST",
        body: JSON.stringify({ isIndia }),
      });
      const order = await orderRes.json();

      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "ANSH Forms",
          description: `Pro Plan — ${order.displayAmount}/month`,
          order_id: order.orderId,
          prefill: {
            name: user.name || "",
            email: user.email || "",
          },
          theme: { color: "#10b981" },
          handler: async (response) => {
            try {
              await apiClient("/api/billing/razorpay/verify", {
                method: "POST",
                body: JSON.stringify(response),
              });
              setUser({ ...user, pricingPlan: "Pro" });
              setSuccess(true);
              resolve();
            } catch (verifyErr: unknown) {
              const msg =
                verifyErr instanceof Error ? verifyErr.message : "Payment verification failed.";
              setError(msg);
              reject(verifyErr);
            }
          },
          modal: {
            ondismiss: () => {
              setUpgrading(false);
              resolve();
            },
          },
        });

        rzp.on("payment.failed", (resp) => {
          setError(resp.error?.description || "Payment failed. Please try again.");
          setUpgrading(false);
          reject(new Error("payment failed"));
        });

        rzp.open();
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message !== "payment failed") {
        setError(err.message);
      }
      console.error("Upgrade error:", err);
    } finally {
      setUpgrading(false);
    }
  };

  const proFeatures = [...PRO_PLAN_FEATURES];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto select-none">
      <div className="text-center space-y-2 select-none">
        <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-block">
          Pricing
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-none pt-1">
          Simple plans for every team
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-md mx-auto leading-relaxed">
          {PRICING_COPY.sectionSubtitle}{" "}
          {isIndia
            ? "India pricing in INR."
            : "International pricing in USD."}{" "}
          Secure checkout powered by Razorpay.
        </p>
        <p className="text-[11px] font-bold text-primary max-w-md mx-auto">
          {PRICING_COPY.trialNote}
        </p>
      </div>

      {user && (
        <div className="crm-card bg-card border-border/85 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              {isPro ? (
                <Crown className="h-5 w-5 text-primary" />
              ) : (
                <Sparkles className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Current Plan
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base font-black text-slate-800 dark:text-zinc-100 leading-none">
                  {planName}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${planBadge.cls}`}>
                  {planBadge.text}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:justify-end">
            <CalendarClock className={`h-5 w-5 shrink-0 ${expiryIsAlert ? "text-rose-500" : "text-slate-400"}`} />
            <div className="sm:text-right">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                {expiryLabel}
              </span>
              <span className={`text-sm font-bold leading-none ${expiryIsAlert ? "text-rose-500" : "text-slate-700 dark:text-zinc-200"}`}>
                {expiryValue}
              </span>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600 flex gap-2.5 items-start animate-fadeInDown">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-black uppercase tracking-wider text-[10px]">Payment successful</div>
            <p className="text-slate-500 mt-1 leading-normal font-bold">
              Your workspace is now on Pro — you can create unlimited forms.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="crm-card bg-card border-border/85 p-6 flex flex-col justify-between relative">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Free Starter</span>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-4xl font-black text-slate-800 dark:text-zinc-100">
                {isIndia ? "₹0" : "$0"}
              </span>
              <span className="text-xs text-slate-400 font-bold">/ month</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal font-medium">
              {PRICING_COPY.freeDescription}
            </p>
            <div className="h-[1px] bg-border/40 my-2" />
            <ul className="space-y-2.5 text-xs font-semibold">
              {FREE_PLAN_INCLUDED.map((feat) => (
                <li key={feat} className="flex gap-2 items-start text-slate-600 dark:text-slate-300">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
              {FREE_PLAN_EXCLUDED.map((feat) => (
                <li key={feat} className="flex gap-2 items-start text-slate-400 dark:text-slate-500">
                  <X className="h-4 w-4 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5" />
                  <span className="line-through decoration-slate-400">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-6">
            <button
              disabled
              className="w-full py-3 rounded-xl border border-border/80 text-xs font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-zinc-800/10 cursor-not-allowed text-center"
            >
              {user?.pricingPlan === "Free" || user?.pricingPlan === "Free Trial"
                ? "Your Active Plan"
                : "Free Plan"}
            </button>
          </div>
        </div>

        <div className="crm-card bg-card border-primary p-6 flex flex-col justify-between relative ring-2 ring-primary/10">
          <span className="absolute top-4 right-4 bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full text-[8px] font-black tracking-widest uppercase">
            Recommended
          </span>
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase text-primary tracking-wider">Professional Suite</span>
            <div className="flex items-baseline gap-1 pt-1">
              <span className="text-4xl font-black text-slate-800 dark:text-zinc-100">{pricing.display}</span>
              <span className="text-xs text-slate-400 font-bold">/ month</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal font-medium">
              {PRICING_COPY.proDescription}
            </p>
            <div className="h-[1px] bg-border/40 my-2" />
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {proFeatures.map((feat) => (
                <li key={feat} className="flex gap-2 items-start">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span className="font-bold">{feat}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-6">
            {user?.pricingPlan === "Pro" ? (
              <button
                disabled
                className="w-full py-3 rounded-xl border border-emerald-500/20 text-xs font-black uppercase tracking-wider text-emerald-500 bg-emerald-500/10 text-center cursor-default"
              >
                Pro Plan Active
              </button>
            ) : (
              <button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                <CreditCard className="h-4.5 w-4.5 shrink-0" />
                <span>{upgrading ? "Opening checkout..." : `Pay ${pricing.display} with Razorpay`}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
