"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Eye, BarChart3, Trash2, Copy, Archive, Check, FileText, Sparkles, Search, ArrowRight, Layers, Pencil, AlertTriangle, ChevronDown, LayoutGrid, List, MoreVertical, QrCode } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { FORM_TEMPLATES } from "@/config/templates";
import { FEATURES } from "@/config/features";
import { cn } from "@/lib/utils";
import { isUiOnlyMode, openDraftPlayground, mockAiDraftFromPrompt } from "@/lib/draft-form";
import { apiClient } from "@/lib/api-client";
import { Tooltip } from "@/components/ui/tooltip";
import { Portal } from "@/components/ui/portal";
import { FormCardSkeleton, FormTableSkeleton } from "@/components/ui/skeleton";
import { FormQrModal } from "@/components/forms/form-qr-modal";
import { getFormPublicUrl, getFormPublicPath } from "@/lib/form-public-url";
import { useFormCategories } from "@/hooks/use-form-categories";
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug";

interface FormItem {
  id: string;
  title: string;
  description: string;
  category?: string;
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

export default function FormsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useUIStore((state) => state.user);
  const setActiveForm = useUIStore((state) => state.setActiveForm);
  const { categories: formCategories } = useFormCategories();
  const companySlug = useWorkspaceSlug();

  // States
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft" | "archived">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);

  // Form Creation Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"blank" | "template" | "ai">("blank");
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [aiPrompt, setAiPrompt] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Custom Delete Confirmation Modal State
  const [formToDelete, setFormToDelete] = useState<FormItem | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [nameCopied, setNameCopied] = useState(false);

  // Rename Form Modal State
  const [formToRename, setFormToRename] = useState<FormItem | null>(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [qrForm, setQrForm] = useState<FormItem | null>(null);

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    const filter = (searchParams.get("filter") || "all") as "all" | "published" | "draft" | "archived";
    setStatusFilter(filter);
  }, [searchParams]);

  const fetchForms = async () => {
    try {
      const res = await apiClient("/api/forms");
      const data = await res.json();
      setForms(data.forms);
    } catch (err) {
      console.error("Error fetching forms:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBlank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (user?.pricingPlan === "Free" && forms.length >= 5) {
      alert("Upgrade to PRO to create more than 5 forms. Check out the Pricing page!");
      router.push("/pricing");
      return;
    }

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
      setCreateError(null);
      return;
    }

    setCreating(true);
    setCreateError(null);
    try {
      const res = await apiClient("/api/forms", {
        method: "POST",
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,
          category: formCategory,
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

      const data = await res.json();
      setIsModalOpen(false);
      setFormTitle("");
      setFormDesc("");
      setCreateError(null);
      fetchForms();
      useUIStore.getState().addGlobalAlert("success", "Form created successfully!");
      router.push(`/forms/${data.form.id}/edit`);
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

    if (user?.pricingPlan === "Free" && forms.length >= 5) {
      alert("Upgrade to PRO to create more than 5 forms. Check out the Pricing page!");
      router.push("/pricing");
      return;
    }

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

    setCreating(true);
    try {
      const res = await apiClient("/api/forms", {
        method: "POST",
        body: JSON.stringify({
          title: template.title,
          description: template.description,
          category: template.category || "General",
          fields: template.fields,
          landingPage: template.landingPage,
          settings: template.settings,
        }),
      });

      const data = await res.json();
      setIsModalOpen(false);
      fetchForms();
      useUIStore.getState().addGlobalAlert("success", "Form template deployed successfully!");
      router.push(`/forms/${data.form.id}/edit`);
    } catch (err) {
      console.error("Create template form error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleCreateAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    if (user?.pricingPlan === "Free" && forms.length >= 5) {
      alert("Upgrade to PRO to create more than 5 forms. Check out the Pricing page!");
      router.push("/pricing");
      return;
    }

    if (isUiOnlyMode()) {
      setActiveForm(mockAiDraftFromPrompt(aiPrompt));
      setIsModalOpen(false);
      setAiPrompt("");
      router.push("/forms/draft/edit");
      return;
    }

    setCreating(true);
    try {
      const res = await apiClient("/api/ai/generate", {
        method: "POST",
        body: JSON.stringify({ prompt: aiPrompt }),
      });

      const data = await res.json();
      const formRes = await apiClient("/api/forms", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          fields: data.fields,
          landingPage: data.landingPage,
          settings: data.settings,
        }),
      });

      const formData = await formRes.json();
      setIsModalOpen(false);
      setAiPrompt("");
      fetchForms();
      useUIStore.getState().addGlobalAlert("success", "AI form generated successfully!");
      router.push(`/forms/${formData.form.id}/edit`);
    } catch (err) {
      console.error("AI form creation error:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteForm = async (id: string) => {
    try {
      const res = await apiClient(`/api/forms/${id}`, { method: "DELETE" });
      if (res.ok) {
        setForms(forms.filter((f) => f.id !== id));
        useUIStore.getState().addGlobalAlert("success", "Form deleted permanently.");
      }
    } catch (err) {
      console.error("Delete form error:", err);
    }
  };

  const handleRenameForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formToRename || !renameTitle.trim()) return;

    setRenaming(true);
    try {
      const form = formToRename;
      const res = await apiClient(`/api/forms/${form.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: renameTitle,
          description: form.description,
          category: form.category,
          isPublished: form.isPublished,
          slug: form.slug,
          fields: typeof form.fields === "string" ? JSON.parse(form.fields) : form.fields,
          landingPage: typeof form.landingPage === "string" ? JSON.parse(form.landingPage) : form.landingPage,
          settings: typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings,
        }),
      });

      if (res.ok) {
        setFormToRename(null);
        setRenameTitle("");
        fetchForms();
        useUIStore.getState().addGlobalAlert("success", "Form renamed successfully.");
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to rename form.");
      }
    } catch (err: any) {
      console.error("Rename form error:", err);
      alert(err.message || "Failed to rename form.");
    } finally {
      setRenaming(false);
    }
  };

  const handleDuplicateForm = async (form: FormItem) => {
    try {
      const parsedFields = typeof form.fields === "string" ? JSON.parse(form.fields) : form.fields;
      const parsedLanding = typeof form.landingPage === "string" ? JSON.parse(form.landingPage) : form.landingPage;
      const parsedSettings = typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings;

      const res = await apiClient("/api/forms", {
        method: "POST",
        body: JSON.stringify({
          title: `${form.title} (Copy)`,
          description: form.description,
          fields: parsedFields,
          landingPage: parsedLanding,
          settings: parsedSettings,
        }),
      });

      if (res.ok) {
        fetchForms();
        useUIStore.getState().addGlobalAlert("success", "Form duplicated successfully.");
      }
    } catch (err) {
      console.error("Duplicate form error:", err);
    }
  };

  const handleToggleArchive = async (form: FormItem) => {
    try {
      const parsedSettings = typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings || {};
      const isArchived = !!parsedSettings.isArchived;
      const updatedSettings = { ...parsedSettings, isArchived: !isArchived };

      const res = await apiClient(`/api/forms/${form.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          isPublished: form.isPublished,
          slug: form.slug,
          fields: typeof form.fields === "string" ? JSON.parse(form.fields) : form.fields,
          landingPage: typeof form.landingPage === "string" ? JSON.parse(form.landingPage) : form.landingPage,
          settings: updatedSettings,
        }),
      });

      if (res.ok) {
        fetchForms();
        useUIStore.getState().addGlobalAlert("success", isArchived ? "Form successfully unarchived." : "Form successfully archived.");
      }
    } catch (err) {
      console.error("Archive form error:", err);
    }
  };

  const handleCopyLink = (slug: string) => {
    if (!companySlug) return;
    navigator.clipboard.writeText(getFormPublicUrl(companySlug, slug));
    setCopiedId(slug);
    useUIStore.getState().addGlobalAlert("success", "Public link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter & Search Forms
  const filteredForms = forms.filter((form) => {
    const parsedSettings = typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings || {};
    const isArchived = !!parsedSettings.isArchived;

    // Search query match
    const matchesSearch = form.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          form.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          form.slug.toLowerCase().includes(searchQuery.toLowerCase());

    // Category match
    const matchesCategory = !categoryFilter || categoryFilter === "All" || 
                            (form.category || "General").toLowerCase() === categoryFilter.toLowerCase();

    if (!matchesCategory) return false;

    // Status match
    if (statusFilter === "archived") return matchesSearch && isArchived;
    if (isArchived) return false; // Hide archived ones under other views

    if (statusFilter === "published") return matchesSearch && form.isPublished;
    if (statusFilter === "draft") return matchesSearch && !form.isPublished;

    return matchesSearch;
  });

  const renderActionDropdown = (form: FormItem, isTable: boolean = false) => {
    const parsedSettings = typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings || {};
    const isArchived = !!parsedSettings.isArchived;

    return (
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setOpenActionMenuId(openActionMenuId === form.id ? null : form.id);
          }}
          className={cn(
            "h-8 w-8 rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-450 hover:text-slate-700 dark:hover:text-zinc-205 cursor-pointer transition-colors outline-none",
            openActionMenuId === form.id && "bg-slate-100 dark:bg-slate-800 border-primary/40 text-primary"
          )}
        >
          <MoreVertical className="h-4.5 w-4.5" />
        </button>

        {openActionMenuId === form.id && (
          <>
            <div 
              className="fixed inset-0 z-30 bg-transparent" 
              onClick={(e) => {
                e.stopPropagation();
                setOpenActionMenuId(null);
              }} 
            />
            
            <div className={cn(
              "absolute mt-1.5 w-44 rounded-xl border border-border bg-card p-1.5 shadow-lg z-45 animate-fadeInDown select-none text-left",
              isTable ? "right-0 top-full origin-top-right" : "right-0 bottom-full mb-1.5 origin-bottom-right"
            )}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId(null);
                  router.push(`/forms/${form.id}/edit`);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
              >
                <Pencil className="h-4 w-4 text-slate-450 dark:text-slate-500" />
                <span>Edit Form</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId(null);
                  setFormToRename(form);
                  setRenameTitle(form.title);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
              >
                <FileText className="h-4 w-4 text-slate-455 dark:text-slate-500" />
                <span>Rename Form</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId(null);
                  router.push(`/forms/${form.id}/view`);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
              >
                <Eye className="h-4 w-4 text-slate-455 dark:text-slate-500" />
                <span>View Live</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId(null);
                  router.push(`/forms/${form.id}/responses`);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
              >
                <BarChart3 className="h-4 w-4 text-slate-455 dark:text-slate-500" />
                <span>Analytics</span>
              </button>

              {form.isPublished && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenActionMenuId(null);
                    setQrForm(form);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
                >
                  <QrCode className="h-4 w-4 text-slate-455 dark:text-slate-500" />
                  <span>Form QR Code</span>
                </button>
              )}

              {form.isPublished && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenActionMenuId(null);
                    handleCopyLink(form.slug);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
                >
                  {copiedId === form.slug ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-450">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-455 dark:text-slate-500" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId(null);
                  handleDuplicateForm(form);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
              >
                <Copy className="h-4 w-4 text-slate-455 dark:text-slate-500" />
                <span>Duplicate</span>
              </button>

              <div className="h-[1px] bg-border/60 my-1" />

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId(null);
                  handleToggleArchive(form);
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
              >
                <Archive className={cn("h-4 w-4", isArchived ? "text-amber-500" : "text-slate-450 dark:text-slate-500")} />
                <span>{isArchived ? "Unarchive" : "Archive"}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenActionMenuId(null);
                  setFormToDelete(form);
                  setDeleteConfirmationText("");
                }}
                className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-left cursor-pointer transition-all"
              >
                <Trash2 className="h-4 w-4 text-rose-400" />
                <span>Delete Form</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
            My Forms List
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Build, search, filter, duplicate, archive, and manage form records.
          </p>
        </div>
        
        <button
          onClick={() => { setCreateError(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-4 py-3 shadow-sm hover:scale-[1.02] active:scale-95 cursor-pointer duration-200"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>Create Form</span>
        </button>
      </div>

      {/* Controls: Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between select-none w-full">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forms by name or slug..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold outline-none focus:border-primary/50 text-slate-800 dark:text-zinc-200"
          />
        </div>

        {/* Right controls: View toggle + Category filter */}
        <div className="flex gap-3 items-center w-full sm:w-auto shrink-0 justify-end">
          {/* Grid / Table view toggle */}
          <div className="flex items-center rounded-xl border border-border bg-card p-1 gap-0.5">
            <Tooltip content="Grid View">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "bg-primary/10 text-primary"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Table View">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-7 w-7 rounded-lg flex items-center justify-center transition-all cursor-pointer",
                  viewMode === "table"
                    ? "bg-primary/10 text-primary"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                )}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>

          {/* Category filter dropdown */}
          <div className="flex gap-2 items-center">
            <span className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">Category:</span>
            <div className="relative min-w-[140px]">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full appearance-none px-3.5 pr-9 py-2.5 text-xs font-bold rounded-xl border border-border bg-card text-slate-700 dark:text-zinc-300 outline-none focus:border-primary/50 cursor-pointer shadow-sm"
              >
                <option value="All">All Categories</option>
                {formCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450 dark:text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Forms Grid Cards */}
      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <FormCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <FormTableSkeleton rows={8} />
        )
      ) : filteredForms.length === 0 ? (
        <div className="crm-card bg-card border-border/80 p-16 text-center select-none max-w-xl mx-auto space-y-4">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <FileText className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Forms Found</h3>
            <p className="text-xs text-slate-400">Try adjusting your filters, query string, or create a brand new form canvas.</p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* ── GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredForms.map((form) => {
            const parsedSettings = typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings || {};
            const isArchived = !!parsedSettings.isArchived;
            const conv = form.views > 0 ? ((form._count.submissions / form.views) * 100).toFixed(1) + "%" : "0.0%";

            return (
              <div key={form.id} className="crm-card bg-card border-border p-6.5 hover:translate-y-[-6px] hover:shadow-xl hover:shadow-teal-500/5 hover:border-primary duration-300 flex flex-col justify-between relative group">
                <div className="space-y-4">
                  {/* Status Bar */}
                  <div className="flex justify-between items-center select-none gap-2 min-w-0">
                    <div className="flex gap-1.5 items-center shrink-0">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-[9px] font-black uppercase border tracking-wider",
                        isArchived
                          ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          : form.isPublished
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {isArchived ? "Archived" : form.isPublished ? "Published" : "Draft"}
                      </span>
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-border/50 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        {form.category || "General"}
                      </span>
                    </div>
                    <span
                      className="text-xs text-slate-400 dark:text-slate-500 font-mono truncate min-w-0 text-right"
                      title={`/${companySlug || "…"}/${form.slug}`}
                    >
                      /{companySlug || "…"}/{form.slug}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-1">
                    <h3
                      onClick={() => router.push(`/forms/${form.id}/edit`)}
                      className="text-base font-extrabold text-slate-805 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-1 cursor-pointer hover:underline decoration-primary/50 underline-offset-4"
                    >
                      {form.title}
                    </h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[38px] leading-relaxed">
                      {form.description || "No description provided for this form builder record."}
                    </p>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50/50 dark:bg-slate-900/30 p-3.5 rounded-xl border border-border/40 text-center font-mono">
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 block tracking-wider">Views</span>
                      <span className="text-sm font-black text-slate-850 dark:text-zinc-200">{form.views}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 block tracking-wider">Responses</span>
                      <span className="text-sm font-black text-slate-850 dark:text-zinc-200">{form._count.submissions}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase text-slate-450 dark:text-slate-500 block tracking-wider">Conv</span>
                      <span className="text-sm font-black text-slate-850 dark:text-zinc-200">{conv}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Row */}
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-6 select-none relative">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    Actions
                  </span>
                  {renderActionDropdown(form, false)}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── TABLE VIEW ── */
        <div className="crm-card bg-card border-border overflow-visible">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 bg-slate-50/50 dark:bg-[#121625]/40 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                <th className="px-5 py-3.5">Form Name</th>
                <th className="px-5 py-3.5">Category</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-center">Views</th>
                <th className="px-5 py-3.5 text-center">Responses</th>
                <th className="px-5 py-3.5 text-center">Conv %</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredForms.map((form) => {
                const parsedSettings = typeof form.settings === "string" ? JSON.parse(form.settings) : form.settings || {};
                const isArchived = !!parsedSettings.isArchived;
                const conv = form.views > 0 ? ((form._count.submissions / form.views) * 100).toFixed(1) + "%" : "0.0%";

                return (
                  <tr key={form.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                    {/* Form Name */}
                    <td className="px-5 py-3.5">
                      <div
                        onClick={() => router.push(`/forms/${form.id}/edit`)}
                        className="font-bold text-xs text-slate-800 dark:text-zinc-100 group-hover:text-primary cursor-pointer hover:underline underline-offset-4 decoration-primary/50 truncate max-w-[240px]"
                      >
                        {form.title}
                      </div>
                      <div
                        className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[240px]"
                        title={`/${companySlug || "…"}/${form.slug}`}
                      >
                        /{companySlug || "…"}/{form.slug}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-3.5">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-border/50 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                        {form.category || "General"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <span className={cn(
                        "px-2.5 py-0.5 rounded text-[9px] font-black uppercase border tracking-wider",
                        isArchived
                          ? "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          : form.isPublished
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      )}>
                        {isArchived ? "Archived" : form.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-black font-mono text-slate-700 dark:text-zinc-200">{form.views}</span>
                    </td>

                    {/* Responses */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-black font-mono text-slate-700 dark:text-zinc-200">{form._count.submissions}</span>
                    </td>

                    {/* Conversion */}
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-xs font-black font-mono text-primary">{conv}</span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5 relative">
                      <div className="flex items-center justify-end">
                        {renderActionDropdown(form, true)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE FORM DIALOG MODAL */}
      {isModalOpen && (
        <Portal>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4">
            <div className="absolute inset-0" onClick={() => !creating && setIsModalOpen(false)} aria-hidden />
            
            <div className="bg-card w-full max-w-[660px] rounded-3xl border border-border shadow-2xl p-6 relative z-10 animate-fadeInDown flex flex-col max-h-[90vh]">
              <h2 className="text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-2.5 select-none">
                <Plus className="h-5.5 w-5.5 text-primary" />
                <span>Create New Form</span>
              </h2>
              
              {/* Modal Tabs */}
              <div className="flex border-b border-border/50 mt-4 select-none">
                {[
                  { id: "blank", label: "Blank Form", icon: FileText },
                  { id: "template", label: "Use Template", icon: Layers },
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
                        "flex-1 py-3.5 text-sm font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 cursor-pointer transition-colors",
                        activeTab === tab.id
                          ? "border-primary text-primary"
                          : "border-transparent text-slate-400 hover:text-slate-655 dark:hover:text-slate-200"
                      )}
                    >
                      <Icon className="h-4.5 w-4.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Modal Contents based on tabs */}
              <div className="flex-1 overflow-y-auto mt-6 pr-1 min-h-[220px]">
                
                {/* TAB 1: BLANK FORM */}
                {activeTab === "blank" && (
                  <form onSubmit={handleCreateBlank} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold uppercase text-slate-450 dark:text-slate-400 tracking-wider">Form Title</label>
                      <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Early Childhood Admissions"
                        className="premium-input text-sm font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold uppercase text-slate-455 dark:text-slate-400 tracking-wider">Description (Optional)</label>
                      <textarea
                        value={formDesc}
                        onChange={(e) => setFormDesc(e.target.value)}
                        placeholder="Specify helper description details here..."
                        className="premium-input text-sm h-24 resize-none font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold uppercase text-slate-455 dark:text-slate-400 tracking-wider">Category</label>
                      <div className="relative">
                        <select
                          value={formCategory}
                          onChange={(e) => setFormCategory(e.target.value)}
                          className="w-full appearance-none premium-input text-sm font-bold bg-card pr-10"
                        >
                          {formCategories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-455 dark:text-slate-500 pointer-events-none" />
                      </div>
                    </div>
                    {createError && (
                      <p className="text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                        {createError}
                      </p>
                    )}
                    <div className="flex justify-end gap-2 pt-4">
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
                    <p className="text-sm text-slate-400 dark:text-slate-500 select-none">
                      Select a curated layout template to initialize questions instantly:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {FORM_TEMPLATES.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => !creating && handleCreateTemplate(item.id)}
                          className="crm-card p-5 text-left bg-card hover:bg-slate-50 dark:hover:bg-slate-900 border-border/80 cursor-pointer flex flex-col justify-between"
                        >
                          <div className="space-y-2">
                            <div className="text-sm font-extrabold text-slate-800 dark:text-zinc-100 flex items-center justify-between gap-2">
                              <span className="truncate">{item.title}</span>
                              <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded uppercase border tracking-wider shrink-0",
                                item.settings.brandColor === "emerald" && "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
                                item.settings.brandColor === "purple" && "text-purple-500 bg-purple-500/10 border-purple-500/20",
                                item.settings.brandColor === "amber" && "text-amber-500 bg-amber-500/10 border-amber-500/20",
                                item.settings.brandColor === "ocean" && "text-sky-500 bg-sky-500/10 border-sky-500/20"
                              )}>
                                {item.settings.brandColor}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mt-4">
                            Includes: {item.fields.length} predefined questions
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: AI PROMPT */}
                {FEATURES.aiFormGenerator && activeTab === "ai" && (
                  <form onSubmit={handleCreateAI} className="space-y-4">
                    <p className="text-sm text-slate-400 dark:text-slate-500 select-none">
                      Provide a description prompt. The AI Form Generator will construct questions, FAQs, and accent settings automatically.
                    </p>
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-extrabold uppercase text-slate-455 dark:text-slate-400 tracking-wider">AI Prompt</label>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Create a waitlist form for a premium developer toolkit. Include github accounts, role options, and a dark slate cover design."
                        className="premium-input text-sm h-28 resize-none font-semibold"
                        required
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
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
                        <Sparkles className="h-4.5 w-4.5 shrink-0" />
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

      {/* DELETE FORM CONFIRMATION MODAL */}
      {formToDelete && (
        <Portal>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
            <div className="absolute inset-0" onClick={() => setFormToDelete(null)} aria-hidden />
            
            <div className="bg-card w-full max-w-[480px] rounded-3xl border border-border shadow-2xl p-6 relative z-10 animate-fadeInDown flex flex-col">
              <div className="flex items-center gap-3 text-rose-500 mb-4 select-none">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black uppercase tracking-wider">Delete Form Permanently</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">This action cannot be undone.</p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed flex items-center gap-1.5 flex-wrap">
                  <span>You are about to permanently delete</span>
                  <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-lg border border-border/80 font-black">
                    <strong className="text-slate-800 dark:text-zinc-150 font-extrabold">{formToDelete.title}</strong>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(formToDelete.title);
                        setNameCopied(true);
                        setTimeout(() => setNameCopied(false), 1500);
                      }}
                      className="text-slate-450 hover:text-slate-655 dark:hover:text-zinc-300 cursor-pointer p-0.5 transition-colors"
                      title="Copy Form Name"
                    >
                      {nameCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </span>
                  <span>and all of its associated response logs.</span>
                </p>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">
                    To confirm, type the name of the form:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={deleteConfirmationText}
                      onChange={(e) => setDeleteConfirmationText(e.target.value)}
                      placeholder={formToDelete.title}
                      className="w-full pl-4 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs font-semibold outline-none focus:border-rose-500/50 text-slate-805 dark:text-zinc-100"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 select-none">
                  <button
                    type="button"
                    onClick={() => setFormToDelete(null)}
                    className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={deleteConfirmationText !== formToDelete.title}
                    onClick={() => {
                      handleDeleteForm(formToDelete.id);
                      setFormToDelete(null);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:hover:bg-rose-600 text-white font-black text-xs uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Delete Permanently
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}

      {/* RENAME FORM MODAL */}
      {formToRename && (
        <Portal>
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/55 p-4 animate-fadeIn">
            <div className="absolute inset-0" onClick={() => !renaming && setFormToRename(null)} aria-hidden />
            
            <form 
              onSubmit={handleRenameForm}
              className="bg-card w-full max-w-[480px] rounded-3xl border border-border shadow-2xl p-6 relative z-10 animate-fadeInDown flex flex-col"
            >
              <div className="flex items-center gap-3 mb-4 select-none">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Pencil className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-zinc-150">Rename Form Canvas</h3>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Specify a new display title for your form builder.</p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-450 dark:text-slate-400 tracking-wider">
                    Form Name Title
                  </label>
                  <input
                    type="text"
                    value={renameTitle}
                    onChange={(e) => setRenameTitle(e.target.value)}
                    placeholder="Enter new form title..."
                    className="premium-input text-sm font-bold w-full"
                    required
                    disabled={renaming}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 select-none">
                  <button
                    type="button"
                    onClick={() => setFormToRename(null)}
                    disabled={renaming}
                    className="px-4 py-2.5 rounded-xl border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={renaming || !renameTitle.trim() || renameTitle === formToRename.title}
                    className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-50 cursor-pointer transition-all"
                  >
                    {renaming ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </Portal>
      )}

      <FormQrModal
        open={!!qrForm}
        onClose={() => setQrForm(null)}
        formTitle={qrForm?.title || "Form"}
        slug={qrForm?.slug || ""}
      />
    </div>
  );
}
