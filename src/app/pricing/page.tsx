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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [helpedBySaathi, setHelpedBySaathi] = useState(false);
  const [inputSaathiCode, setInputSaathiCode] = useState("");
  const [workspaceSaathiCode, setWorkspaceSaathiCode] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) return;
    apiClient("/api/workspace")
      .then((res) => res.json())
      .then((data) => {
        if (data?.workspace?.saathicode) {
          setWorkspaceSaathiCode(data.workspace.saathicode);
          setInputSaathiCode(data.workspace.saathicode);
        }
      })
      .catch((err) => console.error("Error fetching workspace details:", err));
  }, [user]);

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

  const handleUpgrade = async (saathiCode?: string) => {
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
              const verifyRes = await apiClient("/api/billing/razorpay/verify", {
                method: "POST",
                body: JSON.stringify({
                  ...response,
                  saathicode: helpedBySaathi ? saathiCode : undefined,
                }),
              });
              const verifyData = await verifyRes.json();
              setUser({ 
                ...user, 
                pricingPlan: verifyData.profile.pricingPlan,
                trialEndsAt: verifyData.profile.trialEndsAt
              });
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
            <div className="flex flex-col items-start gap-0.5 pt-1">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-800 dark:text-zinc-100">{pricing.display}</span>
                <span className="text-xs text-slate-400 font-bold">/ month</span>
              </div>
              {pricing.currency === "INR" && (
                <span className="text-[10px] font-bold text-slate-400 leading-none">
                  + 18% GST
                </span>
              )}
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
                onClick={() => setShowConfirmModal(true)}
                disabled={upgrading}
                className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                <CreditCard className="h-4.5 w-4.5 shrink-0" />
                <span>{upgrading ? "Opening checkout..." : "Renew Now"}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowConfirmModal(true)}
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

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-[#030308]/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md bg-white dark:bg-[#0c0f1d] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 select-none animate-fadeInDown">
            {/* Close Button */}
            <button 
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Plan Header */}
            <div className="space-y-1.5 pr-8">
              <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-block">
                Confirm Subscription
              </span>
              <h3 className="text-xl font-black text-slate-800 dark:text-zinc-100">
                Upgrade to Professional Suite
              </h3>
              <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                Get full access to all premium features, custom branding, and unlimited form responses.
              </p>
            </div>

            {/* Plan Info Card */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/40 border border-slate-100 dark:border-zinc-800/60 flex flex-col gap-2.5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">Billing Period</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-zinc-200">Monthly Billing</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                    {pricing.currency === "INR" ? "Base Amount" : "Amount"}
                  </span>
                  <span className={pricing.currency === "INR" ? "text-sm font-extrabold text-slate-700 dark:text-zinc-200" : "text-lg font-black text-primary"}>
                    {pricing.display}
                  </span>
                </div>
              </div>
              {pricing.currency === "INR" && (
                <>
                  <div className="h-[1px] bg-slate-200/60 dark:bg-zinc-800/60" />
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-500 dark:text-zinc-400">GST (18%)</span>
                    <span className="font-bold text-slate-600 dark:text-zinc-300">₹71.82</span>
                  </div>
                  <div className="h-[1px] bg-slate-200/60 dark:bg-zinc-800/60" />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Grand Total</span>
                    <span className="text-lg font-black text-primary">₹471</span>
                  </div>
                </>
              )}
            </div>

            {/* Helped by ANSH Saathi Toggle Section */}
            <div className="space-y-3.5 border-t border-border/40 pt-4">
              <label className="flex items-center justify-between cursor-pointer select-none">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                    Helped by ANSH Saathi?
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold block leading-tight">
                    Toggle to attribute this subscription to an ANSH Saathi
                  </span>
                </div>
                
                {/* Switch toggle layout */}
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={helpedBySaathi}
                    onChange={(e) => {
                      setHelpedBySaathi(e.target.checked);
                      if (!e.target.checked) {
                        // Keep input code synced with workspace code if turning off
                        setInputSaathiCode(workspaceSaathiCode || "");
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-200 dark:bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </div>
              </label>

              {/* Toggle Content (Saathi Code input) */}
              {helpedBySaathi && (
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/25 border border-zinc-150 dark:border-zinc-800/40 animate-fadeInDown">
                  <label className="text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest block">
                    Saathi Code
                  </label>
                  {workspaceSaathiCode ? (
                    <div className="space-y-1.5">
                      <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-850/60 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300">
                        {workspaceSaathiCode}
                      </div>
                      <p className="text-[9px] text-emerald-600 dark:text-emerald-500 font-semibold leading-tight flex items-center gap-1">
                        ✓ Code pre-loaded from your workspace settings
                      </p>
                    </div>
                  ) : (
                    <input 
                      type="text" 
                      value={inputSaathiCode}
                      onChange={(e) => setInputSaathiCode(e.target.value)}
                      placeholder="e.g. SAATHI-00001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 focus:border-primary/50 text-xs font-bold text-slate-800 dark:text-zinc-150 outline-none transition-all placeholder:text-zinc-400 focus:bg-white"
                      required
                    />
                  )}
                </div>
              )}
            </div>

            {/* Confirm / Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-zinc-400 font-extrabold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowConfirmModal(false);
                  handleUpgrade(inputSaathiCode);
                }}
                disabled={helpedBySaathi && !inputSaathiCode.trim()}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 active:scale-[0.98] duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                Proceed to Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
