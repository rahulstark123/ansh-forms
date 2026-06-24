"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MainSidebar } from "./main-sidebar";
import { SubSidebar } from "./sub-sidebar";
import { AppHeader } from "./app-header";
import { SearchModal } from "./search-modal";
import { useUIStore } from "@/stores/ui-store";
import { supabase } from "@/lib/supabase";
import { isUiOnlyMode } from "@/lib/draft-form";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);
  
  const [loading, setLoading] = useState(true);
  const [bannerVisible, setBannerVisible] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function syncSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User"
            })
          });

          if (res.ok) {
            const data = await res.json();
            if (mounted) {
              setUser(data.user);
              if (data.user.hasCompletedOnboarding === false && pathname !== "/onboarding") {
                router.push("/onboarding");
              }
            }
          }
        } else {
          // No active Supabase session
          if (isUiOnlyMode()) {
            // UI fallback
            const mockUser = {
              id: "mock-user-id",
              email: "visitor@anshapps.com",
              name: "Rahul",
              phone: "9876543210",
              bio: "Form Builder Administrator",
              accent: "emerald",
              wid: 1,
              pricingPlan: "Free Trial",
              trialEndsAt: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
              hasCompletedOnboarding: true
            };
            if (mounted) {
              setUser(mockUser);
            }
          } else {
            if (mounted) {
              setUser(null);
              if (pathname !== "/login" && pathname !== "/signup") {
                router.push("/login");
              }
            }
          }
        }
      } catch (err) {
        console.error("Session sync error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    syncSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        try {
          const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: session.user.email,
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User"
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (mounted) {
              setUser(data.user);
              if (data.user.hasCompletedOnboarding === false && pathname !== "/onboarding") {
                router.push("/onboarding");
              }
            }
          }
        } catch (e) {
          console.error("Auth change sync error:", e);
        }
      } else {
        if (!isUiOnlyMode()) {
          if (mounted) {
            setUser(null);
            router.push("/login");
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, pathname, router]);

  const getTrialDaysLeft = () => {
    if (!user || !user.trialEndsAt) return 0;
    const ends = new Date(user.trialEndsAt).getTime();
    const now = new Date().getTime();
    const diff = ends - now;
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const trialDaysLeft = getTrialDaysLeft();
  const showTrialBanner = bannerVisible && user?.pricingPlan === "Free Trial" && trialDaysLeft > 0;

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#070913] text-zinc-100 flex-col gap-3">
        <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-black tracking-widest uppercase text-slate-500">
          Loading Workspace
        </span>
      </div>
    );
  }

  // Redirect to dashboard if logged in and trying to access root `/`
  if (pathname === "/") {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 1. Main Navigation Sidebar */}
      <MainSidebar />
      
      {/* 2. Secondary Contextual Sidebar */}
      <SubSidebar />

      {/* 3. Right Content Pane */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Pro Trial Notification Banner */}
        {showTrialBanner && (
          <div className="bg-sky-600 dark:bg-sky-750 text-white px-6 py-2 flex items-center justify-between text-xs font-bold shrink-0 z-40 select-none animate-fadeInDown shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>Free Trial Active — all features unlocked - {trialDaysLeft} {trialDaysLeft === 1 ? "day" : "days"} left</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/settings?tab=billing")}
                className="underline text-[10px] uppercase tracking-widest font-black text-sky-100 hover:text-white transition-colors cursor-pointer"
              >
                View Plans
              </button>
              <button
                onClick={() => setBannerVisible(false)}
                className="text-sky-200 hover:text-white p-0.5 rounded transition-colors cursor-pointer font-bold text-sm leading-none"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Top Header Panel */}
        <AppHeader />
        
        {/* Content Viewer */}
        <main className="mesh-gradient min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-7xl p-6 md:p-10 lg:p-12">
            {children}
          </div>
        </main>
      </div>

      {/* Global Command Palette */}
      <SearchModal />
    </div>
  );
}
