"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Eye, BarChart3, Trash2, Copy, Globe, Sparkles, Search, SlidersHorizontal, ArrowRight, Layers, FileText, Check, HelpCircle, Archive } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { Portal } from "@/components/ui/portal";

interface LandingPageItem {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  slug: string;
  views: number;
  fields: any;
  landingPage: any;
  settings: any;
  _count: {
    submissions: number;
  };
  createdAt: string;
}

interface FormOption {
  id: string;
  title: string;
  slug: string;
}

export default function LandingPagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUIStore((state) => state.user);

  // States
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Creation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"blank" | "template" | "ai">("blank");
  const [pageTitle, setPageTitle] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [connectedFormSlug, setConnectedFormSlug] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filter = (searchParams.get("filter") || "all") as "all" | "published" | "draft" | "archived";
    setStatusFilter(filter);
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/forms");
      if (res.ok) {
        const data = await res.json();
        
        // Landing pages have isLandingPage setting
        const landingPages = data.forms.filter((f: any) => {
          const s = typeof f.settings === "string" ? JSON.parse(f.settings) : f.settings || {};
          return !!s.isLandingPage;
        });

        // Standard forms (options to connect to)
        const standardForms = data.forms.filter((f: any) => {
          const s = typeof f.settings === "string" ? JSON.parse(f.settings) : f.settings || {};
          return !s.isLandingPage;
        }).map((f: any) => ({
          id: f.id,
          title: f.title,
          slug: f.slug
        }));

        setPages(landingPages);
        setForms(standardForms);
      }
    } catch (err) {
      console.error("Error fetching landing pages data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageTitle.trim() || !connectedFormSlug) return;

    setCreating(true);
    
    let slug = pageSlug.trim().toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
    slug = slug || pageTitle.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageTitle,
          description: `Landing page for connected form /f/${connectedFormSlug}`,
          fields: [], // Landing pages don't hold fields directly
          landingPage: {
            enabled: true,
            heroTitle: pageTitle,
            heroSubtitle: "Welcome to our admissions portal. Please review instructions and complete your application below.",
            connectedFormSlug: connectedFormSlug,
            faqs: [
              { question: "What is this landing page about?", answer: "This page collects admissions and leads connected to our form databases." }
            ],
            contactEmail: user?.email || "support@anshapps.com",
            contactPhone: ""
          },
          settings: {
            isLandingPage: true,
            brandColor: "emerald",
            thankYouTitle: "Submission Recorded!",
            thankYouMessage: "Your response details have been registered."
          }
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setPageTitle("");
        setPageSlug("");
        setConnectedFormSlug("");
        fetchData();
      }
    } catch (err) {
      console.error("Create blank landing page error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTemplate = async (templateId: string) => {
    setCreating(true);
    try {
      // Connect to the first form if exists, or fallback
      const defaultFormSlug = forms[0]?.slug || "default-form";

      let templateTitle = "";
      let heroTitle = "";
      let heroSub = "";
      let brand = "emerald";

      if (templateId === "admissions") {
        templateTitle = "Academic Admissions Hub";
        heroTitle = "Enroll in Admissions 2026";
        heroSub = "Unlock early registrations and map out your academic journey today.";
        brand = "purple";
      } else if (templateId === "events") {
        templateTitle = "Tech Summit Event";
        heroTitle = "Global Developer Summit 2026";
        heroSub = "Book seats to access workshops, keynotes, and live certification tracks.";
        brand = "amber";
      } else {
        templateTitle = "Lead Capture Portal";
        heroTitle = "Unlock Professional Toolkit";
        heroSub = "Leave contact credentials to download our premium guide book.";
        brand = "ocean";
      }

      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: templateTitle,
          description: `Landing Page template connected to /f/${defaultFormSlug}`,
          fields: [],
          landingPage: {
            enabled: true,
            heroTitle: heroTitle,
            heroSubtitle: heroSub,
            connectedFormSlug: defaultFormSlug,
            faqs: [
              { question: "How long does verification take?", answer: "Verification processes take about 2-3 business days." }
            ],
            contactEmail: user?.email || "support@anshapps.com",
            contactPhone: ""
          },
          settings: {
            isLandingPage: true,
            brandColor: brand,
            thankYouTitle: "Thank You!",
            thankYouMessage: "Your application details are registered."
          }
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      console.error("Create template error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setCreating(true);
    try {
      // AI Landing page creates both landing page AND form if no form matches!
      const defaultFormSlug = forms[0]?.slug || "default-form";

      // Call prompt generator endpoint (using local fallback mock if no Gemini key)
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, isLandingPage: true }),
      });

      if (res.ok) {
        const data = await res.json();
        
        const saveRes = await fetch("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title || "AI Generated Page",
            description: `Generated Landing Page for prompt: ${aiPrompt}`,
            fields: [],
            landingPage: {
              enabled: true,
              heroTitle: data.title || "Welcome to Our Platform",
              heroSubtitle: data.description || "Describe it. Generate it.",
              connectedFormSlug: defaultFormSlug,
              faqs: data.landingPage?.faqs || [
                { question: "What is this page?", answer: "This page was auto-generated by the AI form builder." }
              ],
              contactEmail: user?.email || "ai@anshapps.com",
              contactPhone: ""
            },
            settings: {
              isLandingPage: true,
              brandColor: data.settings?.brandColor || "emerald",
              thankYouTitle: "Registered!",
              thankYouMessage: "AI generated page processed submission."
            }
          }),
        });

        if (saveRes.ok) {
          setIsModalOpen(false);
          setAiPrompt("");
          fetchData();
        }
      }
    } catch (err) {
      console.error("AI creation error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this landing page?")) return;
    try {
      const res = await fetch(`/api/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setPages(pages.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Delete landing page error:", err);
    }
  };

  const handleCopyLink = (slug: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(slug);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDuplicatePage = async (page: LandingPageItem) => {
    try {
      const parsedLanding = typeof page.landingPage === "string" ? JSON.parse(page.landingPage) : page.landingPage;
      const parsedSettings = typeof page.settings === "string" ? JSON.parse(page.settings) : page.settings;

      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `${page.title} (Copy)`,
          description: page.description,
          fields: [],
          landingPage: parsedLanding,
          settings: parsedSettings,
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Duplicate landing page error:", err);
    }
  };

  const handleToggleArchive = async (page: LandingPageItem) => {
    try {
      const parsedSettings = typeof page.settings === "string" ? JSON.parse(page.settings) : page.settings || {};
      const isArchived = !!parsedSettings.isArchived;
      const updatedSettings = { ...parsedSettings, isArchived: !isArchived };

      const res = await fetch(`/api/forms/${page.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          description: page.description,
          isPublished: page.isPublished,
          slug: page.slug,
          fields: typeof page.fields === "string" ? JSON.parse(page.fields) : page.fields,
          landingPage: typeof page.landingPage === "string" ? JSON.parse(page.landingPage) : page.landingPage,
          settings: updatedSettings,
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error("Archive landing page error:", err);
    }
  };

  const filteredPages = pages.filter((page) => {
    const parsedSettings = typeof page.settings === "string" ? JSON.parse(page.settings) : page.settings || {};
    const isArchived = !!parsedSettings.isArchived;

    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === "archived") return matchesSearch && isArchived;
    if (isArchived) return false;

    if (statusFilter === "published") return matchesSearch && page.isPublished;
    if (statusFilter === "draft") return matchesSearch && !page.isPublished;

    return matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
            Landing Pages Hub
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Build, publish, and duplicate premium form landing pages connected to database lists.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-4 py-3 shadow-md shadow-primary/20 hover:scale-[1.02] active:scale-95 cursor-pointer duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Landing Page</span>
        </button>
      </div>

      {/* Controls: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between select-none">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search landing pages by name or slug..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold outline-none focus:border-primary/50 text-slate-800 dark:text-zinc-200"
          />
        </div>

        <div className="flex gap-2 items-center w-full md:w-auto overflow-x-auto pb-1">
          <SlidersHorizontal className="h-4 w-4 text-slate-400 shrink-0 hidden sm:block" />
          {[
            { id: "all", label: "All Pages" },
            { id: "published", label: "Published" },
            { id: "draft", label: "Drafts" },
            { id: "archived", label: "Archived" }
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => router.push(`/landing-pages?filter=${btn.id}`)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all",
                statusFilter === btn.id
                  ? "bg-primary/10 text-primary border-primary/30"
                  : "bg-card text-slate-500 border-border hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400 flex flex-col gap-2 justify-center items-center">
          <div className="h-7 w-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span>Fetching landing pages...</span>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="crm-card bg-card border-border/80 p-16 text-center select-none max-w-xl mx-auto space-y-4">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <Globe className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Landing Pages Built</h3>
            <p className="text-xs text-slate-400">Launch templates, utilize AI generation tools, or build custom layouts.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => {
            const lp = typeof page.landingPage === "string" ? JSON.parse(page.landingPage) : page.landingPage || {};
            const connSlug = lp.connectedFormSlug || "None";
            const conv = page.views > 0 ? ((page._count.submissions / page.views) * 100).toFixed(1) + "%" : "0.0%";
            const parsedSettings = typeof page.settings === "string" ? JSON.parse(page.settings) : page.settings || {};
            const isArchived = !!parsedSettings.isArchived;

            return (
              <div key={page.id} className="crm-card bg-card border-border p-5 hover:translate-y-[-4px] hover:shadow-lg hover:border-primary duration-300 flex flex-col justify-between group">
                <div className="space-y-3">
                  <div className="flex justify-between items-center select-none text-[10px] text-slate-400 font-mono">
                    <div className="flex gap-1.5 items-center">
                      <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded font-black uppercase text-[8px]">
                        LP Portal
                      </span>
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase border",
                        isArchived
                          ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          : page.isPublished
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {isArchived ? "Archived" : page.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <span>/p/{page.slug}</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-1">
                      {page.title}
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                      <span>Connected Form:</span>
                      <span className="font-mono font-bold text-slate-600 dark:text-zinc-350">/f/{connSlug}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-900/30 p-2.5 rounded-xl border border-border/40 text-center font-mono select-none">
                    <div>
                      <span className="text-[8px] font-black uppercase text-slate-400 block">Traffic</span>
                      <span className="text-xs font-black text-slate-700 dark:text-zinc-350">{page.views}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-slate-400 block">Leads</span>
                      <span className="text-xs font-black text-slate-700 dark:text-zinc-350">{page._count.submissions}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black uppercase text-slate-400 block">Conv</span>
                      <span className="text-xs font-black text-slate-700 dark:text-zinc-350">{conv}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-5 select-none">
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCopyLink(page.slug)}
                      className="h-8 w-8 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                      title="Copy Public Link"
                    >
                      {copiedId === page.slug ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => router.push(`/forms/${page.id}/edit`)}
                      className="h-8 w-8 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                      title="Edit Landing Page"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleDuplicatePage(page)}
                      className="h-8 w-8 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 cursor-pointer"
                      title="Duplicate Page"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleToggleArchive(page)}
                      className={cn(
                        "h-8 w-8 rounded-lg border border-border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer",
                        isArchived ? "text-amber-500 bg-amber-500/5 border-amber-500/20" : "text-slate-400 hover:text-slate-700"
                      )}
                      title={isArchived ? "Unarchive Page" : "Archive Page"}
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePage(page.id)}
                      className="h-8 w-8 rounded-lg border border-border hover:bg-rose-50 dark:hover:bg-rose-955/20 flex items-center justify-center text-slate-400 hover:text-rose-500 cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE LANDING PAGE MODAL */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4">
            <div className="absolute inset-0" onClick={() => !creating && setIsModalOpen(false)} aria-hidden />
            
            <div className="bg-card w-full max-w-[620px] rounded-3xl border border-border shadow-2xl p-6 relative z-10 animate-fadeInDown flex flex-col max-h-[90vh]">
              <h2 className="text-lg font-black text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-2 select-none">
                <Globe className="h-5 w-5 text-primary animate-pulse" />
                <span>Create Landing Page</span>
              </h2>
              
              <div className="flex border-b border-border/50 mt-4 select-none">
                {[
                  { id: "blank", label: "Blank Page", icon: FileText },
                  { id: "template", label: "Templates", icon: Layers },
                  { id: "ai", label: "AI Generator", icon: Sparkles }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={cn(
                        "flex-1 py-3 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-colors",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-y-auto mt-6 pr-1 min-h-[220px]">
                
                {/* TAB 1: BLANK LANDING PAGE */}
                {activeTab === "blank" && (
                  <form onSubmit={handleCreateBlank} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Page Title</label>
                      <input
                        type="text"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        placeholder="e.g. Early Childhood Admissions"
                        className="premium-input text-xs"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">URL Slug (Optional)</label>
                        <input
                          type="text"
                          value={pageSlug}
                          onChange={(e) => setPageSlug(e.target.value)}
                          placeholder="e.g. early-childhood"
                          className="premium-input text-xs"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Connect Existing Form</label>
                        <select
                          value={connectedFormSlug}
                          onChange={(e) => setConnectedFormSlug(e.target.value)}
                          className="premium-input text-xs"
                          required
                        >
                          <option value="">Select a form database...</option>
                          {forms.map((f) => (
                            <option key={f.id} value={f.slug}>{f.title} (/f/{f.slug})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        disabled={creating}
                        className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating || !pageTitle.trim() || !connectedFormSlug}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      >
                        {creating ? "Creating..." : "Build Landing Page"}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: TEMPLATES GRID */}
                {activeTab === "template" && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 select-none">
                      Choose a pre-built landing page template. Note: it will automatically connect to your first active form directory.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: "admissions", title: "Admissions Hub Template", desc: "Hero header, FAQ block, Connected Form, and Contacts footer designed for educational setups.", color: "purple" },
                        { id: "events", title: "Event Booking Page", desc: "Modern styling designed for ticket sales, summits, workshops, and certifications booking lists.", color: "amber" },
                        { id: "leads", title: "Product Launch Capture", desc: "Hype builder lead generation page connectable to early waitlists.", color: "ocean" }
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => !creating && forms.length > 0 && handleCreateTemplate(item.id)}
                          className={cn(
                            "crm-card p-4 text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border/85 cursor-pointer flex flex-col justify-between",
                            forms.length === 0 && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          <div>
                            <div className="text-xs font-black text-slate-800 dark:text-zinc-100 flex items-center justify-between">
                              <span>{item.title}</span>
                              <span className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border",
                                item.color === "purple" && "text-purple-500 bg-purple-500/10 border-purple-500/20",
                                item.color === "amber" && "text-amber-500 bg-amber-500/10 border-amber-500/20",
                                item.color === "ocean" && "text-sky-500 bg-sky-500/10 border-sky-500/20"
                              )}>
                                {item.color}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                              {item.desc}
                            </p>
                          </div>
                          {forms.length === 0 && (
                            <div className="text-[8px] font-black text-rose-500 mt-3">
                              Requires at least 1 Form created to connect
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: AI LANDING PAGE */}
                {activeTab === "ai" && (
                  <form onSubmit={handleCreateAI} className="space-y-4">
                    <p className="text-xs text-slate-400 select-none">
                      Provide a description prompt. The AI Landing Page Builder will generate sections, layouts, FAQs, and connected headers.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Prompt</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Create a landing page for college admissions. Focus on premium tech campus, high placement rate, and include early-admissions FAQs."
                        className="premium-input text-xs h-24 resize-none"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        disabled={creating}
                        className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-slate-100 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating || !aiPrompt.trim() || forms.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>{creating ? "Generating..." : "Generate Landing Page"}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
