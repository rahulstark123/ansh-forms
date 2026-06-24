"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BarChart3, Settings, CreditCard, Layers, ChevronLeft, ChevronRight, Palette, Sun, Moon, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function MainSidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const setCollapsed = useUIStore((state) => state.setSidebarCollapsed);

  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);

  const [showThemePanel, setShowThemePanel] = useState(false);

  const navigation = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Forms", href: "/forms", icon: FileText },
    { label: "Templates", href: "/templates", icon: Layers },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
  ];

  const accents = [
    {
      name: "Electric Indigo",
      value: "purple",
      bgClass: "bg-indigo-500",
      description: "Premium default — vibrant & modern",
    },
    {
      name: "Forest Emerald",
      value: "emerald",
      bgClass: "bg-emerald-500",
      description: "Trustworthy and growth-oriented",
    },
    {
      name: "Sapphire Blue",
      value: "ocean",
      bgClass: "bg-sky-500",
      description: "Clear and focused for high-density data",
    },
    {
      name: "Modern Graphite",
      value: "graphite",
      bgClass: "bg-slate-500",
      description: "Minimalist and sophisticated",
    },
    {
      name: "Amber Sunset",
      value: "amber",
      bgClass: "bg-amber-500",
      description: "Warm and cozy for creative work",
    },
  ];

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleAccentChange = async (newAccent: string) => {
    // Update local state instantly for latency-free switch
    if (user) {
      setUser({ ...user, accent: newAccent });
    }
    const root = window.document.documentElement;
    root.setAttribute("data-accent", newAccent);

    // Save choice to database
    if (user?.email) {
      try {
        await fetch("/api/auth/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, accent: newAccent }),
        });
      } catch (err) {
        console.error("Auto-save accent error:", err);
      }
    }
  };

  return (
    <aside className={cn(
      "flex h-full flex-col border-r border-border bg-card transition-[width] duration-300 ease-out shadow-sm select-none shrink-0",
      collapsed ? "w-[72px]" : "w-[240px]"
    )}>
      {/* Header Logo */}
      <div className="flex h-16 items-center gap-2 px-4 border-b border-border/50">
        <div className="h-12 w-12 flex items-center justify-center shrink-0 overflow-hidden">
          <Image
            src="/logoAnshapps.png"
            alt="Ansh Apps Logo"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
        </div>
        {!collapsed && (
          <span className="font-extrabold tracking-tight uppercase text-sm text-foreground animate-fadeIn">
            Ansh Forms
          </span>
        )}
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {navigation.map((item) => {
          // Match active route: dashboard is exact, others are startsWith
          const isActive = item.href === "/dashboard" 
            ? pathname === "/dashboard"
            : pathname.startsWith(item.href) || (item.href === "/forms" && pathname.startsWith("/forms"));
            
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80"
              )}
            >
              <Icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
              {!collapsed && <span className="animate-fadeIn">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-border/50 relative">
        {/* Personalization Button */}
        <button
          onClick={() => setShowThemePanel(!showThemePanel)}
          className={cn(
            "w-full text-left text-xs font-semibold flex gap-2 items-center px-3 py-2.5 cursor-pointer mb-1.5 rounded-xl transition-all",
            showThemePanel 
              ? "bg-primary/10 text-primary" 
              : "text-slate-455 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-205 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
          )}
        >
          <Palette className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="animate-fadeIn">Personalization</span>}
        </button>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-left text-xs font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 flex gap-2 items-center px-3 py-2.5 cursor-pointer rounded-xl transition-all"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0" />
          )}
          {!collapsed && <span className="animate-fadeIn">Collapse Sidebar</span>}
        </button>

        {/* Right-Hand Personalization Sidebar Drawer */}
        {showThemePanel && (
          <>
            {/* Backdrop Overlay */}
            <div 
              onClick={() => setShowThemePanel(false)}
              className="fixed inset-0 bg-black/35 dark:bg-black/55 backdrop-blur-xs z-40 cursor-pointer animate-fadeIn"
            />

            {/* Right-Side Drawer Container */}
            <div className="fixed top-0 right-0 h-full w-[400px] bg-card border-l border-border/80 shadow-2xl z-50 flex flex-col justify-between p-6 select-none animate-slideInRight">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border/55">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-zinc-150">
                    Personalization
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold leading-normal mt-0.5">
                    Tailor your workspace appearance and color system.
                  </p>
                </div>
                <button
                  onClick={() => setShowThemePanel(false)}
                  className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto py-6 space-y-6 scrollbar-thin">
                {/* Appearance Section */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Appearance
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Light Card */}
                    <button
                      onClick={() => handleThemeChange("light")}
                      className={cn(
                        "flex flex-col gap-2 rounded-2xl border p-4 text-left relative transition-all cursor-pointer",
                        theme === "light"
                          ? "border-primary ring-2 ring-primary/10 bg-primary/[0.01]"
                          : "border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center border",
                        theme === "light"
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-slate-50 border-border/40 text-slate-400 dark:bg-slate-800/40"
                      )}>
                        <Sun className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-slate-800 dark:text-zinc-200">Light</span>
                        <span className="text-[9px] text-slate-400 font-semibold block leading-tight mt-0.5">
                          Bright workspace for daytime
                        </span>
                      </div>
                      {theme === "light" && (
                        <span className="absolute top-3 right-3 h-4 w-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center p-0.5 border border-primary-foreground/10">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>

                    {/* Dark Card */}
                    <button
                      onClick={() => handleThemeChange("dark")}
                      className={cn(
                        "flex flex-col gap-2 rounded-2xl border p-4 text-left relative transition-all cursor-pointer",
                        theme === "dark"
                          ? "border-primary ring-2 ring-primary/10 bg-primary/[0.01]"
                          : "border-border/60 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      )}
                    >
                      <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center border",
                        theme === "dark"
                          ? "bg-primary/10 border-primary/20 text-primary"
                          : "bg-slate-50 border-border/40 text-slate-400 dark:bg-slate-800/40"
                      )}>
                        <Moon className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <span className="text-xs font-black block text-slate-800 dark:text-zinc-200">Dark</span>
                        <span className="text-[9px] text-slate-400 font-semibold block leading-tight mt-0.5">
                          Reduced glare for low light
                        </span>
                      </div>
                      {theme === "dark" && (
                        <span className="absolute top-3 right-3 h-4 w-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center p-0.5 border border-primary-foreground/10">
                          <Check className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Accent Color Section */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Accent Color
                  </span>
                  <div className="space-y-2">
                    {accents.map((acc) => {
                      const isActive = (user?.accent || "emerald") === acc.value;
                      return (
                        <button
                          key={acc.value}
                          onClick={() => handleAccentChange(acc.value)}
                          className={cn(
                            "w-full flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all cursor-pointer",
                            isActive
                              ? "border-primary ring-2 ring-primary/10 bg-primary/[0.01]"
                              : "border-border/40 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                          )}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className={cn("h-5.5 w-5.5 rounded-full border border-white/20 shadow-sm shrink-0", acc.bgClass)} />
                            <div>
                              <span className="text-xs font-black block text-slate-800 dark:text-zinc-200">{acc.name}</span>
                              <span className="text-[9px] text-slate-400 font-semibold block leading-tight mt-0.5">
                                {acc.description}
                              </span>
                            </div>
                          </div>
                          {isActive && (
                            <span className="h-4.5 w-4.5 bg-primary text-primary-foreground rounded-full flex items-center justify-center p-0.5">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border flex items-center justify-center text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/40 -mx-6 -mb-6 p-4 rounded-b-none">
                System Synced · Auto-Save Enabled
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
