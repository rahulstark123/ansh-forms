"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Hammer, BarChart3, QrCode, ArrowLeft, Globe, Sparkles, Layers, Check, FileText, User, Building, Settings, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

export function SubSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeForm = useUIStore((state) => state.activeForm);
  const activeFilter = searchParams.get("filter") || "all";
  const activeTab = searchParams.get("tab") || "profile";

  // Settings view SubSidebar
  if (pathname.startsWith("/settings")) {
    const links = [
      { label: "Profile Settings", tab: "profile", href: "/settings?tab=profile", icon: User },
      { label: "Company Settings", tab: "company", href: "/settings?tab=company", icon: Building },
      { label: "Workspace Settings", tab: "workspace", href: "/settings?tab=workspace", icon: Settings },
    ];
    return (
      <aside className="w-60 h-full border-r border-border/60 bg-slate-50/50 dark:bg-[#0e1220]/50 backdrop-blur-md flex flex-col select-none shrink-0">
        <div className="p-4 border-b border-border/40">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <div className="px-5 py-6">
          <span className="text-xs font-black tracking-widest text-primary uppercase">
            Settings
          </span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate mt-1">
            Views & filters
          </h3>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                  isActive
                    ? "bg-card text-primary border border-border/80 shadow-sm font-black"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  // 1. My Forms Main View SubSidebar
  if (pathname === "/forms") {
    const links = [
      { label: "All Forms", filter: "all", href: "/forms?filter=all", icon: FileText },
      { label: "Published Forms", filter: "published", href: "/forms?filter=published", icon: Check },
      { label: "Draft Forms", filter: "draft", href: "/forms?filter=draft", icon: Sparkles },
      { label: "Archived Forms", filter: "archived", href: "/forms?filter=archived", icon: Layers },
    ];
    return (
      <aside className="w-60 h-full border-r border-border/60 bg-slate-50/50 dark:bg-[#0e1220]/50 backdrop-blur-md flex flex-col select-none shrink-0">
        <div className="p-4 border-b border-border/40">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <div className="px-5 py-6">
          <span className="text-xs font-black tracking-widest text-primary uppercase">
            Forms Portal
          </span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate mt-1">
            My Active Forms
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
            Manage forms lists
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((item) => {
            const isActive = activeFilter === item.filter;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                  isActive
                    ? "bg-card text-primary border border-border/80 shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  // 2. Landing Pages Main View SubSidebar
  if (pathname === "/landing-pages") {
    const links = [
      { label: "All Pages", filter: "all", href: "/landing-pages?filter=all", icon: Globe },
      { label: "Published Pages", filter: "published", href: "/landing-pages?filter=published", icon: Check },
      { label: "Draft Pages", filter: "draft", href: "/landing-pages?filter=draft", icon: Sparkles },
      { label: "Archived Pages", filter: "archived", href: "/landing-pages?filter=archived", icon: Layers },
    ];
    return (
      <aside className="w-60 h-full border-r border-border/60 bg-slate-50/50 dark:bg-[#0e1220]/50 backdrop-blur-md flex flex-col select-none shrink-0">
        <div className="p-4 border-b border-border/40">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        <div className="px-5 py-6">
          <span className="text-xs font-black tracking-widest text-primary uppercase">
            Landing Portals
          </span>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate mt-1">
            Landing Pages Hub
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
            Manage live sites
          </p>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {links.map((item) => {
            const isActive = activeFilter === item.filter;
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                  isActive
                    ? "bg-card text-primary border border-border/80 shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    );
  }

  // Extract formId from path
  const match = pathname.match(/^\/forms\/([a-zA-Z0-9-]+)/);
  const formId = match ? match[1] : null;

  // Render only if inside a specific form route
  if (!formId) return null;

  const links = [
    { label: "Editor Canvas", href: `/forms/${formId}/edit`, icon: Hammer },
    { label: "Submissions", href: `/forms/${formId}/responses`, icon: BarChart3 },
  ];

  return (
    <aside className="w-60 h-full border-r border-border/60 bg-slate-50/50 dark:bg-[#0e1220]/50 backdrop-blur-md flex flex-col select-none shrink-0">
      {/* Back to Dashboard */}
      <div className="p-4 border-b border-border/40">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Active Form Header */}
      <div className="px-5 py-6">
        <span className="text-xs font-black tracking-widest text-primary uppercase">
          Form Workspace
        </span>
        <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 truncate mt-1">
          {activeForm?.title || "Loading Form..."}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
          slug: {activeForm?.slug || "..."}
        </p>
      </div>

      {/* Sub navigation items */}
      <nav className="flex-1 px-3 space-y-1">
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all",
                isActive
                  ? "bg-card text-primary border border-border/80 shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50"
              )}
            >
              <Icon className={cn("h-4.5 w-4.5 shrink-0", isActive ? "text-primary" : "text-slate-400")} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Quick link to public page */}
        {activeForm?.slug && (
          <a
            href={`/f/${activeForm.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 transition-all"
          >
            <Globe className="h-4.5 w-4.5 shrink-0 text-slate-400" />
            <span className="flex items-center gap-1.5">
              View Public Link
            </span>
          </a>
        )}
      </nav>

      {/* Visual branding preview indicator */}
      {activeForm?.settings?.brandColor && (
        <div className="p-4 m-4 rounded-xl border border-border/30 bg-card/60 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
            Active Accent
          </span>
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "h-3 w-3 rounded-full border border-white/20",
                activeForm.settings.brandColor === "emerald" && "bg-emerald-500",
                activeForm.settings.brandColor === "amber" && "bg-amber-500",
                activeForm.settings.brandColor === "ocean" && "bg-sky-500",
                activeForm.settings.brandColor === "purple" && "bg-purple-500"
              )}
            />
            <span className="text-xs font-black capitalize text-slate-700 dark:text-slate-300">
              {activeForm.settings.brandColor}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
