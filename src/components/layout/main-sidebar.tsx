"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, BarChart3, Settings, CreditCard, Layers, ChevronLeft, ChevronRight, Palette, Sun, Moon, Check, X, LifeBuoy, LayoutGrid, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useShouldForceSidebarCollapsed } from "@/hooks/use-responsive-shell";

const ECOSYSTEM_APPS = [
  {
    name: "ANSH Booking",
    tagline: "Meeting room & resource booking",
    status: "SOON",
    badgeClass: "bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-500/5",
    dotClass: "bg-rose-500",
    href: "https://booking.anshapps.com",
    isLive: false,
  },
  {
    name: "ANSH Visitor",
    tagline: "Smart lobby & guest management",
    status: "LIVE",
    badgeClass: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20 dark:bg-indigo-500/5",
    dotClass: "bg-indigo-500",
    href: "https://visitor.anshapps.com",
    isLive: true,
  },
  {
    name: "ANSH Tasks",
    tagline: "Team task & project tracker",
    status: "LIVE",
    badgeClass: "bg-sky-500/10 text-sky-500 border-sky-500/20 dark:bg-sky-500/5",
    dotClass: "bg-sky-500",
    href: "https://tasks.anshapps.com",
    isLive: true,
  },
  {
    name: "ANSH HR",
    tagline: "Human resource management",
    status: "LIVE",
    badgeClass: "bg-purple-500/10 text-purple-500 border-purple-500/20 dark:bg-purple-500/5",
    dotClass: "bg-purple-500",
    href: "https://hr.anshapps.com",
    isLive: true,
  },
  {
    name: "ANSH Expense",
    tagline: "Expense & spend operations",
    status: "LIVE",
    badgeClass: "bg-amber-500/10 text-amber-500 border-amber-500/20 dark:bg-amber-500/5",
    dotClass: "bg-amber-500",
    href: "https://expense.anshapps.com",
    isLive: true,
  },
  {
    name: "ANSH Forms",
    tagline: "Smart form builder",
    status: "HERE",
    badgeClass: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 dark:bg-emerald-500/5",
    dotClass: "bg-emerald-500",
    href: "#",
    isLive: true,
    isCurrent: true,
  },
  {
    name: "ANSH Links",
    tagline: "Link-in-bio profile builder",
    status: "LIVE",
    badgeClass: "bg-pink-500/10 text-pink-500 border-pink-500/20 dark:bg-pink-500/5",
    dotClass: "bg-pink-500",
    href: "https://links.anshapps.com",
    isLive: true,
  },
];

export function MainSidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((state) => state.sidebarCollapsed);
  const setCollapsed = useUIStore((state) => state.setSidebarCollapsed);
  const forceCollapsed = useShouldForceSidebarCollapsed();
  const isCollapsed = collapsed || forceCollapsed;

  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);

  const [showThemePanel, setShowThemePanel] = useState(false);
  const [showAppsMenu, setShowAppsMenu] = useState(false);

  const navigation = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "My Forms", href: "/forms", icon: FileText },
    { label: "Templates", href: "/templates", icon: Layers },
    { label: "Analytics", href: "/analytics", icon: BarChart3 },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Pricing", href: "/pricing", icon: CreditCard },
    { label: "Support", href: "/support", icon: LifeBuoy },
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
      isCollapsed ? "w-[72px]" : "w-[240px]"
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
        {!isCollapsed && (
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
              {!isCollapsed && <span className="animate-fadeIn">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer Controls */}
      <div className="p-3 border-t border-border/50 relative">
        {/* ANSH Apps Popover Menu */}
        {showAppsMenu && (
          <>
            <div 
              onClick={() => setShowAppsMenu(false)}
              className="fixed inset-0 z-40 cursor-default"
            />
            <div className="absolute bottom-[calc(100%+8px)] left-3 w-[295px] z-50 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0f1d] p-4 shadow-xl select-none animate-fadeIn flex flex-col gap-3">
              <div className="px-1">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-450 dark:text-zinc-500">
                  ANSH ECOSYSTEM
                </h4>
                <p className="text-[11px] font-bold text-slate-500 dark:text-zinc-450 mt-0.5">
                  Jump to your other ANSH apps
                </p>
              </div>

              <div className="h-[1px] bg-slate-100 dark:bg-zinc-800/60" />

              <div className="max-h-[300px] overflow-y-auto pr-1 space-y-1 scrollbar-thin">
                {ECOSYSTEM_APPS.map((app) => {
                  const isClickable = !app.isCurrent && app.status !== "SOON";
                  const content = (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <span className={cn("h-2.5 w-2.5 rounded-full shrink-0", app.dotClass)} />
                        <div className="text-left">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                              {app.name}
                            </span>
                            {isClickable && (
                              <ExternalLink className="h-3 w-3 text-slate-400 dark:text-zinc-550 shrink-0" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-tight mt-0.5 max-w-[150px] truncate font-medium">
                            {app.tagline}
                          </p>
                        </div>
                      </div>
                      <span className={cn(
                        "text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0", 
                        app.badgeClass
                      )}>
                        {app.status}
                      </span>
                    </div>
                  );

                  if (isClickable && app.href) {
                    return (
                      <a
                        key={app.name}
                        href={app.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center p-2 rounded-xl border border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-all duration-200"
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <div
                      key={app.name}
                      className={cn(
                        "flex items-center p-2 rounded-xl border transition-all duration-200",
                        app.isCurrent
                          ? "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20"
                          : "border-transparent opacity-50 cursor-not-allowed"
                      )}
                    >
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* ANSH Apps Button */}
        <button
          onClick={() => {
            setShowAppsMenu(!showAppsMenu);
            setShowThemePanel(false);
          }}
          className={cn(
            "w-full text-left text-xs font-semibold flex justify-between items-center px-3 py-2.5 cursor-pointer mb-1.5 rounded-xl transition-all",
            showAppsMenu 
              ? "bg-primary/10 text-primary font-bold" 
              : "text-slate-455 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-205 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
          )}
        >
          <div className="flex gap-2 items-center">
            <LayoutGrid className="h-5 w-5 shrink-0" />
            {!isCollapsed && <span className="animate-fadeIn">ANSH Apps</span>}
          </div>
          {!isCollapsed && (
            showAppsMenu ? <ChevronDown className="h-4 w-4 text-slate-450 dark:text-slate-500 shrink-0" /> : <ChevronUp className="h-4 w-4 text-slate-450 dark:text-slate-500 shrink-0" />
          )}
        </button>

        {/* Personalization Button */}
        <button
          onClick={() => {
            setShowThemePanel(!showThemePanel);
            setShowAppsMenu(false);
          }}
          className={cn(
            "w-full text-left text-xs font-semibold flex gap-2 items-center px-3 py-2.5 cursor-pointer mb-1.5 rounded-xl transition-all",
            showThemePanel 
              ? "bg-primary/10 text-primary" 
              : "text-slate-455 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-205 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
          )}
        >
          <Palette className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span className="animate-fadeIn">Personalization</span>}
        </button>

        {/* Collapse Button */}
        <button
          onClick={() => {
            if (forceCollapsed) return;
            setCollapsed(!collapsed);
          }}
          disabled={forceCollapsed}
          title={forceCollapsed ? "Sidebar stays collapsed on smaller screens" : undefined}
          className={cn(
            "w-full text-left text-xs font-semibold flex gap-2 items-center px-3 py-2.5 rounded-xl transition-all",
            forceCollapsed
              ? "text-slate-500 cursor-not-allowed opacity-60"
              : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800/60 cursor-pointer"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 shrink-0" />
          ) : (
            <ChevronLeft className="h-5 w-5 shrink-0" />
          )}
          {!isCollapsed && <span className="animate-fadeIn">Collapse Sidebar</span>}
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
