"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Eye, 
  BarChart3, 
  Trash2, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  Globe, 
  ArrowRight, 
  Inbox, 
  Percent, 
  TrendingUp, 
  ChevronRight, 
  Clock, 
  AlertCircle,
  FileCheck,
  Layers
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { Portal } from "@/components/ui/portal";
import { FORM_TEMPLATES } from "@/config/templates";
import { FEATURES } from "@/config/features";
import { cn } from "@/lib/utils";
import { StatCardSkeleton, ResponseTableSkeleton, TopFormsSkeleton } from "@/components/ui/skeleton";
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug";
import { isUiOnlyMode, openDraftPlayground, mockAiDraftFromPrompt } from "@/lib/draft-form";
import { apiClient } from "@/lib/api-client";

interface FormItem {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  slug: string;
  views: number;
  _count: {
    submissions: number;
  };
  createdAt: string;
  settings: any;
}

interface RecentSubmission {
  id: string;
  customId: string;
  status: string;
  answers: any;
  createdAt: string;
  form: {
    id: string;
    title: string;
    slug: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useUIStore((state) => state.user);
  const setActiveForm = useUIStore((state) => state.setActiveForm);
  const companySlug = useWorkspaceSlug();
  
  // State
  const [forms, setForms] = useState<FormItem[]>([]);
  const [recentResponses, setRecentResponses] = useState<RecentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingResponses, setLoadingResponses] = useState(true);
  
  // Form Creation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"blank" | "template" | "ai">("blank");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalForms: 0,
    totalViews: 0,
    totalResponses: 0,
    avgConversion: "0.0%"
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiClient("/api/forms");
      const data = await res.json();
      setForms(data.forms || []);
      computeStats(data.forms || []);
    } catch (err) {
      console.error("Error fetching forms dashboard:", err);
    } finally {
      setLoading(false);
    }

    try {
      setLoadingResponses(true);
      const res = await apiClient("/api/forms/recent-responses");
      const data = await res.json();
      setRecentResponses(data.submissions || []);
    } catch (err) {
      console.error("Error fetching recent responses:", err);
    } finally {
      setLoadingResponses(false);
    }
  };

  const computeStats = (items: FormItem[]) => {
    // Filter out landing page counts for stats if necessary or include them as assets
    const total = items.length;
    const views = items.reduce((acc, curr) => acc + curr.views, 0);
    const responses = items.reduce((acc, curr) => acc + (curr._count?.submissions || 0), 0);
    const avg = views > 0 ? ((responses / views) * 100).toFixed(1) + "%" : "0.0%";
    
    setStats({
      totalForms: total,
      totalViews: views,
      totalResponses: responses,
      avgConversion: avg
    });
  };

  const handleCreateBlank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (isUiOnlyMode()) {
      openDraftPlayground(router, setActiveForm, {
        title: formTitle,
        description: formDesc,
        landingPage: {
          heroTitle: formTitle,
          heroSubtitle: formDesc || "Please fill in the form fields below.",
          contactEmail: user?.email || "",
        },
      });
      setIsModalOpen(false);
      setFormTitle("");
      setFormDesc("");
      return;
    }

    if (user?.pricingPlan === "Free" && stats.totalForms >= 5) {
      alert("Upgrade to PRO to create more than 5 forms. Check out the Pricing page!");
      router.push("/pricing");
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const res = await apiClient("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          fields: [
            { id: "full_name", type: "text", label: "Full Name", placeholder: "Enter your name", required: true },
            { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true }
          ],
          landingPage: {
            enabled: false,
            heroTitle: formTitle,
            heroSubtitle: formDesc || "Please fill in the form fields below.",
            faqs: [],
            contactEmail: user?.email || "",
            contactPhone: ""
          },
          settings: {
            brandColor: "emerald",
            thankYouTitle: "Thank You!",
            thankYouMessage: "Your submission has been recorded."
          }
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsModalOpen(false);
        setFormTitle("");
        setFormDesc("");
        router.push(`/forms/${data.form.id}/edit`);
      }
    } catch (err: any) {
      console.error("Create blank form error:", err);
      setCreateError(err.message || "Failed to create form. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTemplate = async (templateId: string) => {
    const template = FORM_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    if (isUiOnlyMode()) {
      openDraftPlayground(router, setActiveForm, {
        title: template.title,
        description: template.description,
        category: template.category || "General",
        fields: template.fields,
        landingPage: template.landingPage,
        settings: template.settings,
      });
      setIsModalOpen(false);
      return;
    }

    if (user?.pricingPlan === "Free" && stats.totalForms >= 5) {
      alert("Upgrade to PRO to create more than 5 forms. Check out the Pricing page!");
      router.push("/pricing");
      return;
    }

    setCreating(true);
    try {
      const res = await apiClient("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          category: template.category || "General",
          fields: template.fields,
          landingPage: template.landingPage,
          settings: template.settings,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsModalOpen(false);
        router.push(`/forms/${data.form.id}/edit`);
      }
    } catch (err) {
      console.error("Create template form error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    if (isUiOnlyMode()) {
      setActiveForm(mockAiDraftFromPrompt(aiPrompt));
      setIsModalOpen(false);
      setAiPrompt("");
      router.push("/forms/draft/edit");
      return;
    }

    if (user?.pricingPlan === "Free" && stats.totalForms >= 5) {
      alert("Upgrade to PRO to create more than 5 forms. Check out the Pricing page!");
      router.push("/pricing");
      return;
    }

    setCreating(true);
    try {
      const res = await apiClient("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      if (res.ok) {
        const data = await res.json();
        const formRes = await apiClient("/api/forms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: data.title,
            description: data.description,
            fields: data.fields,
            landingPage: data.landingPage,
            settings: data.settings,
          }),
        });

        if (formRes.ok) {
          const formData = await formRes.json();
          setIsModalOpen(false);
          setAiPrompt("");
          router.push(`/forms/${formData.form.id}/edit`);
        }
      }
    } catch (err) {
      console.error("AI form creation error:", err);
    } finally {
      setCreating(false);
    }
  };

  // Top Performing Forms: Forms sorted by conversion rates / submission count (exclude pure landing page shells if needed)
  const topPerformingForms = [...forms]
    .filter((f) => {
      const s = typeof f.settings === "string" ? JSON.parse(f.settings) : f.settings || {};
      return !s.isLandingPage;
    })
    .map((f) => {
      const submissions = f._count?.submissions || 0;
      const rate = f.views > 0 ? (submissions / f.views) * 100 : 0;
      return { ...f, submissions, rate };
    })
    .sort((a, b) => b.rate - a.rate || b.submissions - a.submissions)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 select-none">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Hi {user?.name || "Rahul"}, welcome back. Here is your forms workspace summary.
          </p>
        </div>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => <StatCardSkeleton key={idx} />)
          : [
              { label: "Total Forms", val: stats.totalForms, unit: "Forms", color: "text-primary", icon: FileText },
              { label: "Total Views", val: stats.totalViews, unit: "Views", color: "text-sky-500", icon: Eye },
              { label: "Total Responses", val: stats.totalResponses, unit: "Submissions", color: "text-emerald-500", icon: Inbox },
              { label: "Conversion Rate", val: stats.avgConversion, unit: "Conversion", color: "text-amber-500", icon: Percent },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="crm-card p-5 relative overflow-hidden bg-card border-border shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {item.label}
                    </span>
                    <Icon className={cn("h-4.5 w-4.5", item.color)} />
                  </div>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className={cn("text-3xl font-black tracking-tight", item.color)}>
                      {item.val}
                    </span>
                    {item.unit && <span className="text-[10px] font-bold text-slate-400">{item.unit}</span>}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Quick Actions Panel */}
      <div className="space-y-3 select-none">
        <h2 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="crm-card p-4 text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Plus className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 block">Create Form</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Build a blank or template form</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
          </button>

          <button
            onClick={() => router.push("/templates")}
            className="crm-card p-4 text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 block">Explore Templates</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Choose from 32 pre-built layouts</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
          </button>

          <button
            onClick={() => router.push("/forms")}
            className="crm-card p-4 text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Inbox className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-black text-slate-800 dark:text-zinc-100 block">View Responses</span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Check database records</span>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Recent Responses, Right Top Performing Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Responses Container */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
              Recent Responses
            </h2>
            <span className="text-[10px] font-bold text-slate-400">
              Latest incoming answers
            </span>
          </div>

          <div className="crm-card bg-card border-border overflow-hidden min-h-[300px] flex flex-col">
            {loadingResponses ? (
              <ResponseTableSkeleton rows={5} />
            ) : recentResponses.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-12 select-none">
                <Inbox className="h-8 w-8 text-slate-400 mb-3" />
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">No submissions yet</span>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">
                  Share your public form links to start receiving response logs.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/30 text-[9px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/20 dark:bg-slate-900/10 select-none">
                      <th className="px-5 py-3">Form Name & Ref ID</th>
                      <th className="px-5 py-3">Submission Details</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                    {recentResponses.map((res) => {
                      const date = new Date(res.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      });

                      // Build a preview string from the answers JSON
                      const answerKeys = Object.keys(res.answers || {});
                      const previewStr = answerKeys
                        .slice(0, 2)
                        .map((k) => `${k}: ${res.answers[k]}`)
                        .join(" | ");

                      return (
                        <tr key={res.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-slate-800 dark:text-zinc-100 truncate max-w-[150px]">
                              {res.form?.title || "Unknown Form"}
                            </div>
                            <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                              {res.customId}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate max-w-[200px]" title={previewStr}>
                              {previewStr || "No details submitted."}
                            </div>
                            <div className="text-[8px] text-slate-400 font-bold mt-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{date}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 select-none">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase border",
                              res.status === "Approved" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                              res.status === "Rejected" && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                              res.status === "Under Review" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                              res.status === "Submitted" && "bg-sky-500/10 text-sky-500 border-sky-500/20"
                            )}>
                              {res.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right select-none">
                            <button
                              onClick={() => router.push(`/forms/${res.form.id}/responses`)}
                              className="text-primary hover:underline font-black text-[9px] uppercase tracking-wider cursor-pointer"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Top Performing Forms Container */}
        <div className="space-y-3">
          <div className="flex justify-between items-center select-none">
            <h2 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
              Top Performing Forms
            </h2>
            <span className="text-[10px] font-bold text-slate-400">
              By conversion rate
            </span>
          </div>

          <div className="crm-card bg-card border-border p-5 space-y-4 min-h-[300px] flex flex-col justify-between">
            {loading ? (
              <TopFormsSkeleton rows={5} />
            ) : topPerformingForms.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center select-none p-6">
                <TrendingUp className="h-8 w-8 text-slate-400 mb-3" />
                <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">No active metrics</span>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[150px]">
                  Gather conversions to build a list of top assets.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 flex-1">
                {topPerformingForms.map((item, idx) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
                    <div className="space-y-0.5 text-left max-w-[140px]">
                      <div className="text-xs font-black text-slate-800 dark:text-zinc-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono truncate">
                        /{companySlug || "…"}/{item.slug}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 select-none">
                      <div className="text-right">
                        <span className="text-[10px] font-black text-slate-800 dark:text-zinc-200 block font-mono">
                          {item.submissions}
                        </span>
                        <span className="text-[8px] text-slate-400 font-semibold block">
                          Responses
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-black text-emerald-500 block font-mono">
                          {item.rate.toFixed(1)}%
                        </span>
                        <span className="text-[8px] text-slate-400 font-semibold block">
                          Conversion
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => router.push("/analytics")}
              className="w-full text-center border border-border/80 hover:border-primary/55 rounded-xl py-2.5 text-[9px] font-black uppercase tracking-wider text-slate-500 hover:text-primary transition-all cursor-pointer mt-4 flex items-center justify-center gap-1 select-none"
            >
              <span>View Full Analytics Register</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE FORM DIALOG MODAL */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4">
            <div className="absolute inset-0" onClick={() => !creating && setIsModalOpen(false)} aria-hidden />
            
            <div className="bg-card w-full max-w-[620px] rounded-3xl border border-border shadow-2xl p-6 relative z-10 animate-fadeInDown flex flex-col max-h-[90vh]">
              <h2 className="text-lg font-black text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-2 select-none">
                <Plus className="h-5 w-5 text-primary" />
                <span>Create New Form</span>
              </h2>
              
              {/* Modal Tabs */}
              <div className="flex border-b border-border/50 mt-4 select-none">
                {[
                  { id: "blank", label: "Blank Form", icon: FileText },
                  { id: "template", label: "Use Template", icon: FileCheck },
                  ...(FEATURES.aiFormGenerator
                    ? [{ id: "ai" as const, label: "AI Form Generator", icon: Sparkles }]
                    : []),
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
                          : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Contents based on tabs */}
              <div className="flex-1 overflow-y-auto mt-6 pr-1 min-h-[220px]">
                
                {/* TAB 1: BLANK FORM */}
                {activeTab === "blank" && (
                  <form onSubmit={handleCreateBlank} className="space-y-4 text-left">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Form Title</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Early Childhood Admissions"
                        className="premium-input text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Description (Optional)</label>
                      <textarea
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Specify helper description details here..."
                        className="premium-input text-xs h-20 resize-none font-semibold"
                      />
                    </div>
                    {createError && (
                      <p className="text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                        {createError}
                      </p>
                    )}
                    <div className="flex justify-end gap-2 pt-4 select-none">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        disabled={creating}
                        className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating || !formTitle.trim()}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer"
                      >
                        {creating ? "Creating..." : "Build Canvas"}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 2: TEMPLATES GRID */}
                {activeTab === "template" && (
                  <div className="space-y-4 text-left">
                    <p className="text-xs text-slate-400 select-none">
                      Select a curated layout template to initialize questions instantly:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FORM_TEMPLATES.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => !creating && handleCreateTemplate(item.id)}
                          className="crm-card p-4 text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border/80 cursor-pointer flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-150 flex items-center justify-between gap-2">
                              <span className="truncate">{item.title}</span>
                              <span className={cn(
                                "text-[8px] font-black px-1.5 py-0.5 rounded uppercase border tracking-wider shrink-0",
                                item.settings.brandColor === "emerald" && "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                                item.settings.brandColor === "purple" && "text-purple-500 bg-purple-500/10 border-purple-500/20",
                                item.settings.brandColor === "amber" && "text-amber-500 bg-amber-500/10 border-amber-500/20",
                                item.settings.brandColor === "ocean" && "text-sky-500 bg-sky-500/10 border-sky-500/20"
                              )}>
                                {item.settings.brandColor}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <div className="text-[9px] text-slate-405 font-bold uppercase tracking-wider mt-4">
                            Includes: {item.fields.length} questions
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: AI PROMPT */}
                {FEATURES.aiFormGenerator && activeTab === "ai" && (
                  <form onSubmit={handleCreateAI} className="space-y-4 text-left">
                    <p className="text-xs text-slate-400 select-none">
                      Provide a description prompt. The AI Form Generator will construct questions, FAQs, and accent settings automatically.
                    </p>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">AI Prompt</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Create a waitlist form for a premium developer toolkit. Include github accounts, role options, and a dark slate cover design."
                        className="premium-input text-xs h-24 resize-none"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4 select-none">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        disabled={creating}
                        className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={creating || !aiPrompt.trim()}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <Sparkles className="h-4 w-4 shrink-0" />
                        <span>{creating ? "Generating..." : "Generate Form"}</span>
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
