"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Search, Clock, Calendar, CheckCircle2, AlertCircle, XCircle, ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusResponse {
  formTitle: string;
  brandColor: string;
  submission: {
    customId: string;
    status: string; // Submitted, Under Review, Approved, Rejected
    statusComment: string;
    createdAt: string;
    updatedAt: string;
  };
}

export default function StatusTrackerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const company = params.company as string;
  const slug = params.slug as string;
  const initialId = searchParams.get("id") || "";

  // States
  const [trackingId, setTrackingId] = useState(initialId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<StatusResponse | null>(null);

  useEffect(() => {
    if (initialId) {
      handleSearchStatus(initialId);
    }
  }, [initialId]);

  const handleSearchStatus = async (idToSearch: string) => {
    const queryId = idToSearch.trim();
    if (!queryId) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const res = await fetch(`/api/forms/public/status?customId=${queryId}&slug=${slug}`);
      if (res.ok) {
        const resData = await res.json();
        setData(resData);
      } else {
        const errData = await res.json();
        setError(errData.error || "Application not found. Please verify your tracking ID.");
      }
    } catch (err) {
      console.error("Error searching status timeline:", err);
      setError("Failed to connect to tracking server.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchStatus(trackingId);
  };

  const brandColor = data?.brandColor || "emerald";

  return (
    <div 
      className="min-h-screen text-slate-900 bg-background flex flex-col justify-center p-6 md:p-12 transition-all overflow-y-auto mesh-gradient"
      style={{
        "--primary": 
          brandColor === "emerald" ? "oklch(0.60 0.16 170)" :
          brandColor === "amber" ? "oklch(0.64 0.18 80)" :
          brandColor === "ocean" ? "oklch(0.58 0.16 220)" :
          "oklch(0.58 0.22 280)"
      } as React.CSSProperties}
    >
      <div className="mx-auto w-full max-w-[480px] bg-white border border-border p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
        
        {/* Header back navigation */}
        <div className="flex items-center gap-3 select-none">
          <button
            onClick={() => router.push(`/${company}/${slug}`)}
            className="h-8 w-8 rounded-lg border border-border/80 flex items-center justify-center hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Application Tracking</span>
            <h3 className="text-sm font-black text-slate-800 truncate leading-none mt-0.5">
              {data?.formTitle || "Status Tracker"}
            </h3>
          </div>
        </div>

        {/* Search tracker form */}
        <form onSubmit={handleFormSubmit} className="space-y-2 select-none">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
            Enter Tracking Reference ID
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                placeholder="e.g. ANSH-12345"
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-border focus:border-primary/50 text-xs font-semibold uppercase tracking-widest outline-none placeholder:normal-case placeholder:font-sans placeholder:tracking-normal"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || !trackingId.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>

        {/* LOADING STATE */}
        {loading && (
          <div className="py-12 text-center text-xs font-bold text-slate-400 flex flex-col gap-2 justify-center items-center">
            <div className="h-7 w-7 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <span>Fetching status log...</span>
          </div>
        )}

        {/* ERROR STATE */}
        {error && !loading && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-600 flex gap-2 items-start animate-fadeIn">
            <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* RESULTS STATUS TIMELINE TIMELINE */}
        {data && !loading && (
          <div className="space-y-6 animate-fadeIn">
            
            <div className="h-[1px] bg-border/50" />

            {/* Submission card details */}
            <div className="flex justify-between items-center text-xs font-semibold select-none">
              <div>
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Tracking Code</div>
                <div className="text-sm font-mono font-black text-slate-800 mt-0.5">{data.submission.customId}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Last Activity</div>
                <div className="text-[11px] font-bold mt-0.5">
                  {new Date(data.submission.updatedAt).toLocaleDateString("en-IN", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                  })}
                </div>
              </div>
            </div>

            {/* TIMELINE DISPLAY */}
            <div className="relative pl-8 space-y-8 select-none text-xs">
              {/* Vertical line path */}
              <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-slate-100" />

              {/* Node 1: Submitted (Always Checked) */}
              <div className="relative">
                <span className="absolute -left-[27px] top-0.5 h-5 w-5 rounded-full bg-emerald-500 border-4 border-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="h-3 w-3 text-white fill-emerald-500" />
                </span>
                <div>
                  <h4 className="font-black text-slate-800">Application Submitted</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Logged successfully on{" "}
                    {new Date(data.submission.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "long", year: "numeric"
                    })}
                  </p>
                </div>
              </div>

              {/* Node 2: Under Review */}
              {(() => {
                const isPassed = ["Under Review", "Approved", "Rejected"].includes(data.submission.status);
                const isActive = data.submission.status === "Under Review";

                return (
                  <div className="relative">
                    <span className={cn(
                      "absolute -left-[27px] top-0.5 h-5 w-5 rounded-full border-4 border-white flex items-center justify-center shadow-xs",
                      isPassed ? "bg-amber-500" : "bg-slate-200"
                    )}>
                      {isPassed && <Clock className="h-3 w-3 text-white" />}
                    </span>
                    <div className={cn(!isPassed && "opacity-50")}>
                      <h4 className="font-black text-slate-800">Verification & Review</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isActive
                          ? "Our administrators are currently verifying credentials."
                          : isPassed
                            ? "Review completed."
                            : "Awaiting documents verification queues."}
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Node 3: Decision */}
              {(() => {
                const isApproved = data.submission.status === "Approved";
                const isRejected = data.submission.status === "Rejected";
                const isPending = !isApproved && !isRejected;

                return (
                  <div className="relative">
                    <span className={cn(
                      "absolute -left-[27px] top-0.5 h-5 w-5 rounded-full border-4 border-white flex items-center justify-center shadow-xs",
                      isApproved && "bg-emerald-500",
                      isRejected && "bg-rose-500",
                      isPending && "bg-slate-200"
                    )}>
                      {isApproved && <CheckCircle2 className="h-3 w-3 text-white fill-emerald-500" />}
                      {isRejected && <XCircle className="h-3 w-3 text-white fill-rose-500" />}
                    </span>
                    <div className={cn(isPending && "opacity-50")}>
                      <h4 className="font-black text-slate-800">
                        {isApproved 
                          ? "Approved & Enrolled" 
                          : isRejected 
                            ? "Application Rejected" 
                            : "Final Decision"}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">
                        {isApproved 
                          ? "Congratulations! Your application has been approved." 
                          : isRejected 
                            ? "We regret to inform you that your application was not accepted." 
                            : "Final decision will be logged after review."}
                      </p>
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Admin comment feedback box */}
            {data.submission.statusComment && (
              <div className="p-4 bg-slate-50 border border-border/80 rounded-2xl flex gap-2.5 items-start text-xs font-semibold animate-fadeIn">
                <MessageSquare className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5 animate-float" />
                <div>
                  <div className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Workspace Administrator Note</div>
                  <p className="text-slate-600 leading-relaxed mt-1 italic font-bold">
                    "{data.submission.statusComment}"
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
