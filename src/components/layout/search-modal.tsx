"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Globe, Layers, BarChart3, CreditCard, User, Settings } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { FEATURES } from "@/config/features";

interface SearchAsset {
  id: string;
  title: string;
  slug: string;
  isLandingPage: boolean;
}

export function SearchModal() {
  const router = useRouter();
  const searchOpen = useUIStore((state) => state.searchOpen);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const modalInputRef = useRef<HTMLInputElement>(null);

  // Listen for Ctrl+K/Cmd+K shortcuts globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  // Autofocus input when modal opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        modalInputRef.current?.focus();
      }, 50);
      setSelectedIndex(0);
      setSearchQuery("");
    }
  }, [searchOpen]);

  // Load search data using TanStack Query
  const { data: assets = [] } = useQuery<SearchAsset[]>({
    queryKey: ["forms-search"],
    queryFn: async () => {
      const res = await fetch("/api/forms");
      if (!res.ok) throw new Error("Failed to fetch forms");
      const data = await res.json();
      return (data.forms || []).map((f: any) => {
        const s = typeof f.settings === "string" ? JSON.parse(f.settings) : f.settings || {};
        return {
          id: f.id,
          title: f.title,
          slug: f.slug,
          isLandingPage: !!s.isLandingPage
        };
      });
    },
    enabled: searchOpen,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Static site pages to index in search
  const staticPages = [
    { title: "Dashboard", url: "/dashboard", icon: Layers, description: "Overview statistics, response conversions, and metrics" },
    { title: "My Forms", url: "/forms", icon: FileText, description: "Create, customize, and publish response gathering forms" },
    { title: "Landing Pages", url: "/landing-pages", icon: Globe, description: "Manage landing pages and custom domain targets" },
    ...(FEATURES.aiFormGenerator
      ? [{ title: "AI Builder", url: "/ai-builder", icon: Settings, description: "Generate schemas and fields via AI prompt logic" }]
      : []),
    { title: "Analytics", url: "/analytics", icon: BarChart3, description: "Review form response reports and category distributions" },
    { title: "Pricing & Billing", url: "/pricing", icon: CreditCard, description: "View subscription plans, feature limits, and billing tiers" },
    { title: "Profile Settings", url: "/settings?tab=profile", icon: User, description: "Manage your account profile details and contact info" },
    { title: "Company Settings", url: "/settings?tab=company", icon: Globe, description: "Configure organization structures and localization" },
    { title: "Workspace Settings", url: "/settings?tab=workspace", icon: Settings, description: "Integrate database states and Gemini AI keys" },
    { title: "Billing & Plans", url: "/settings?tab=billing", icon: CreditCard, description: "View subscription plans, feature limits, and billing tiers" },
  ];

  // Filters
  const filteredForms = assets.filter(
    (x) => !x.isLandingPage && x.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLandings = assets.filter(
    (x) => x.isLandingPage && x.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPages = staticPages.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Combine results into a single navigable array
  const allResults = [
    ...filteredPages.map(p => ({ title: p.title, url: p.url, icon: p.icon, category: "PAGES", description: p.description })),
    ...filteredForms.map(f => ({ title: f.title, url: `/forms/${f.id}/edit`, icon: FileText, category: "ACTIVE FORMS", description: `Active response form - url: /f/${f.slug}` })),
    ...filteredLandings.map(l => ({ title: l.title, url: `/forms/${l.id}/edit`, icon: Globe, category: "LANDING PAGES", description: `Custom landing portal - url: /p/${l.slug}` }))
  ];

  // Keyboard navigation inside search modal
  const handleModalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allResults[selectedIndex]) {
        router.push(allResults[selectedIndex].url);
        setSearchQuery("");
        setSearchOpen(false);
      }
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex justify-center bg-black/60 backdrop-blur-sm p-4 pt-[10vh]">
      {/* Backdrop Closer */}
      <div className="fixed inset-0" onClick={() => setSearchOpen(false)} />
      
      <div 
        className="bg-card w-full max-w-2xl rounded-3xl border border-border shadow-2xl relative z-10 animate-fadeInDown flex flex-col max-h-[80vh] overflow-hidden"
        onKeyDown={handleModalKeyDown}
      >
        {/* Modal Input Section */}
        <div className="p-5 border-b border-border/50 flex items-center gap-3">
          <Search className="h-5 w-5 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            ref={modalInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Search pages, forms, settings..."
            className="w-full bg-transparent border-0 outline-none text-sm font-semibold text-slate-805 dark:text-zinc-150 py-1"
          />
          <kbd 
            onClick={() => setSearchOpen(false)}
            className="px-1.5 py-0.5 rounded border border-border bg-slate-50 dark:bg-slate-850 text-[10px] font-mono text-slate-450 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer select-none"
          >
            esc
          </kbd>
        </div>

        {/* Results pane */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-[280px]">
          {allResults.length === 0 ? (
            <div className="py-12 text-center text-xs font-semibold text-slate-450">
              No matching assets or workspace pages found.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Grouped results render */}
              {["PAGES", "ACTIVE FORMS", "LANDING PAGES"].map((cat) => {
                const groupItems = allResults.filter(x => x.category === cat);
                if (groupItems.length === 0) return null;

                return (
                  <div key={cat} className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 block mb-2 select-none">
                      {cat}
                    </span>
                    {groupItems.map((item) => {
                      const globalIdx = allResults.findIndex(x => x.title === item.title && x.url === item.url);
                      const isFocused = selectedIndex === globalIdx;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.url + item.title}
                          onClick={() => {
                            router.push(item.url);
                            setSearchQuery("");
                            setSearchOpen(false);
                          }}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer",
                            isFocused
                              ? "bg-blue-50 dark:bg-sky-955/20 text-slate-900 dark:text-zinc-100"
                              : "hover:bg-slate-50 dark:hover:bg-slate-850/30 text-slate-700 dark:text-zinc-350"
                          )}
                          onMouseEnter={() => setSelectedIndex(globalIdx)}
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            {/* Rounded Icon Circle */}
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                              isFocused
                                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="truncate">
                              <div className="text-sm font-black text-slate-800 dark:text-zinc-200 truncate leading-tight">
                                {item.title}
                              </div>
                              <div className="text-xs text-slate-450 dark:text-slate-500 font-semibold mt-1 truncate">
                                {item.description}
                              </div>
                            </div>
                          </div>
                          {isFocused && (
                            <span className="text-slate-400 dark:text-slate-550 font-mono text-lg font-bold mr-2 select-none animate-fadeIn leading-none">
                              ↵
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Instruction Help Footer */}
        <div className="p-4 px-6 border-t border-border bg-slate-50/20 dark:bg-slate-900/10 text-xs font-semibold text-slate-500 flex justify-between items-center select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded shadow-sm text-[9px] font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded shadow-sm text-[9px] font-mono">↓</kbd>
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-card border border-border rounded shadow-sm text-[9px] font-mono">↵</kbd>
              <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider">open</span>
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {allResults.length} {allResults.length === 1 ? "result" : "results"}
          </div>
        </div>
      </div>
    </div>
  );
}
