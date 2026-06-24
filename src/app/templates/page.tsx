"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers, FileText, Sparkles, ArrowRight, BookOpen, UserCheck, Calendar, Star, Compass, Mail,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { FORM_TEMPLATES } from "@/config/templates";
import { apiClient } from "@/lib/api-client";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Registration", "Feedback", "Lead Gen", "Operations"];
const PAGE_SIZE = 8;

const getTemplateIcon = (id: string) => {
  switch (id) {
    case "admission":
    case "course_enroll":
    case "ebook_download":
      return BookOpen;
    case "event_reg":
    case "webinar":
    case "time_off":
      return Calendar;
    case "waitlist":
    case "contest":
      return Sparkles;
    case "volunteer":
    case "camp_signup":
    case "partner_app":
      return Compass;
    case "membership":
    case "job_app":
    case "client_onboard":
      return UserCheck;
    case "feedback":
    case "employee_sat":
    case "event_feedback":
    case "product_market":
    case "course_eval":
    case "website_feedback":
    case "nps":
    case "service_rating":
      return Star;
    case "newsletter":
      return Mail;
    case "contact":
    case "quote_req":
    case "callback":
    case "expense_report":
    case "purchase_order":
    case "vendor_reg":
      return FileText;
    default:
      return Layers;
  }
};

export default function TemplatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const handleUseFormTemplate = async (templateId: string, customTitle?: string) => {
    setLoading(true);
    
    const template = FORM_TEMPLATES.find((t) => t.id === templateId);
    let creationBody = {};

    if (template) {
      creationBody = {
        title: template.title,
        description: template.description,
        fields: template.fields,
        landingPage: template.landingPage,
        settings: template.settings,
        category: template.category,
      };
    } else {
      // Fallback fallback
      creationBody = {
        title: customTitle || `${templateId.charAt(0).toUpperCase() + templateId.slice(1)} Template`,
        description: `Pre-configured template category for ${templateId} forms building.`,
        fields: [
          { id: "full_name", type: "text", label: "Full Name", placeholder: "Enter name", required: true },
          { id: "email", type: "email", label: "Email Address", placeholder: "name@example.com", required: true }
        ],
        landingPage: {
          enabled: false,
          heroTitle: customTitle || `${templateId} Portal`,
          heroSubtitle: "Register your details today.",
          faqs: [],
          contactEmail: "",
          contactPhone: ""
        },
        settings: {
          brandColor: "emerald",
          thankYouTitle: "Registered successfully!",
          thankYouMessage: "Your submission has been recorded."
        },
        category: "General"
      };
    }

    try {
      const res = await apiClient("/api/forms", {
        method: "POST",
        body: JSON.stringify(creationBody),
      });

      if (res.ok) {
        const data = await res.json();
        useUIStore.getState().addGlobalAlert("success", "Form template deployed successfully!");
        router.push(`/forms/${data.form.id}/edit`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = FORM_TEMPLATES.filter((t) => {
    if (selectedCategory === "All") return true;
    return t.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTemplates.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedTemplates = filteredTemplates.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startItem = (safePage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(safePage * PAGE_SIZE, filteredTemplates.length);

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight leading-tight">
            Pre-built Templates Library
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Deploy full form layouts instantly across 4 different functional categories.
          </p>
        </div>
        <div className="text-xs font-black text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-border select-none shrink-0 self-start md:self-auto">
          Total Templates: <span className="text-primary">{FORM_TEMPLATES.length}</span>
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border/60 pb-4 select-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              "px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl border cursor-pointer transition-all duration-200",
              selectedCategory === cat
                ? "bg-primary border-primary text-primary-foreground shadow-sm"
                : "bg-card border-border/80 text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400 flex flex-col gap-2 justify-center items-center">
          <div className="h-7 w-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span>Creating your template instance...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Results info */}
          <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider select-none">
            <span>
              Showing {startItem}–{endItem} of {filteredTemplates.length} templates
            </span>
            {totalPages > 1 && (
              <span>Page {safePage} of {totalPages}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTemplates.map((item) => {
              const Icon = getTemplateIcon(item.id);
              return (
                <div key={item.id} className="crm-card bg-card border-border/85 p-6 flex flex-col justify-between hover:border-primary duration-200 group">
                  <div className="space-y-4">
                    <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 group-hover:scale-105 duration-200">
                      <Icon className="h-5.5 w-5.5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                        {item.category}
                      </span>
                      <h3 className="text-sm font-black text-slate-800 dark:text-zinc-150 mt-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-450 leading-relaxed mt-2 line-clamp-3 min-h-[54px]">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUseFormTemplate(item.id, item.title)}
                    className="w-full mt-6 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-primary hover:text-primary-foreground border border-border group-hover:border-primary/30 text-xs font-black uppercase tracking-wider text-slate-655 hover:shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Deploy Form</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2 select-none">
              {/* Prev */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const isActive = page === safePage;
                // Show first, last, current ±1, with ellipsis
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - safePage) <= 1;

                if (!showPage) {
                  // Show ellipsis only once between gaps
                  if (page === 2 && safePage > 3) {
                    return <span key={`ellipsis-start`} className="text-xs text-slate-400 px-1 select-none">…</span>;
                  }
                  if (page === totalPages - 1 && safePage < totalPages - 2) {
                    return <span key={`ellipsis-end`} className="text-xs text-slate-400 px-1 select-none">…</span>;
                  }
                  return null;
                }

                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={cn(
                      "h-9 min-w-[36px] px-2.5 flex items-center justify-center rounded-xl border text-xs font-black cursor-pointer transition-all duration-200",
                      isActive
                        ? "bg-primary border-primary text-primary-foreground shadow-sm scale-105"
                        : "bg-card border-border text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-zinc-200"
                    )}
                  >
                    {page}
                  </button>
                );
              })}

              {/* Next */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
