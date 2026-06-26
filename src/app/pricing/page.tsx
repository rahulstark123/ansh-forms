"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import { Check, ShieldCheck, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { getProPricing } from "@/lib/pricing";
import { loadRazorpayScript } from "@/lib/razorpay-checkout";

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

  const freeFeatures = [
    "Up to 5 active forms",
    "Unlimited submission answers",
    "Predefined templates (General)",
    "SVG QR Code Generation",
    "Ansh Forms footer watermarks",
  ];

  const proFeatures = [
    "Unlimited forms building",
    "Automatic Landing Pages mode",
    "Cloudflare R2 File Uploads",
    "Recharts analytics visualizations",
    "Status Timeline trackers",
    "Custom logo and brand accents",
    "Removes ANSH watermark tags",
  ];

  return (
    <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto select-none">
      <div className="text-center space-y-2 select-none">
        <span className="bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase inline-block">
          Pricing
        </span>
        <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-none pt-1">
          Simple plans for every team
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold max-w-sm mx-auto leading-relaxed">
          {isIndia
            ? "India pricing in INR. Secure checkout powered by Razorpay."
            : "International pricing in USD. Secure checkout powered by Razorpay."}
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-600 flex gap-2.5 items-start animate-fadeInDown">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <div className="font-black uppercase tracking-wider text-[10px]">Payment successful</div>
            <p className="text-slate-500 mt-1 leading-normal font-bold">
              Your workspace is now on the Pro plan. All Pro limits are unlocked.
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
              Perfect for schools, events, and local businesses launching simple forms.
            </p>
            <div className="h-[1px] bg-border/40 my-2" />
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {freeFeatures.map((feat) => (
                <li key={feat} className="flex gap-2 items-center">
                  <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
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
              Unlimited forms, analytics, custom branding, and file uploads for growing teams.
            </p>
            <div className="h-[1px] bg-border/40 my-2" />
            <ul className="space-y-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
              {proFeatures.map((feat) => (
                <li key={feat} className="flex gap-2 items-center">
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
