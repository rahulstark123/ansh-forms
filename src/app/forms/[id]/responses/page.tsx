"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  Download, Search, Clock, Calendar, CheckCircle2, AlertCircle, XCircle,
  Eye, RefreshCw, X, ChevronRight, MessageSquare, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  customId: string;
  answers: Record<string, any>;
  status: string; // Submitted, Under Review, Approved, Rejected
  statusComment: string;
  createdAt: string;
}

export default function ResponsesPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.id as string;

  const activeForm = useUIStore((state) => state.activeForm);
  const setActiveForm = useUIStore((state) => state.setActiveForm);

  // States
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"analytics" | "table">("analytics");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("Submitted");
  const [statusComment, setStatusComment] = useState("");

  useEffect(() => {
    fetchSubmissions();
    if (!activeForm) {
      fetchFormDetails();
    }
  }, [formId]);

  const fetchFormDetails = async () => {
    try {
      const res = await fetch(`/api/forms/${formId}`);
      if (res.ok) {
        const data = await res.json();
        const formObj = {
          id: data.form.id,
          title: data.form.title,
          description: data.form.description,
          isPublished: data.form.isPublished,
          slug: data.form.slug,
          views: data.form.views || 0,
          fields: typeof data.form.fields === "string" ? JSON.parse(data.form.fields) : data.form.fields || [],
          steps: typeof data.form.steps === "string" ? JSON.parse(data.form.steps) : data.form.steps || [],
          landingPage: typeof data.form.landingPage === "string" ? JSON.parse(data.form.landingPage) : data.form.landingPage || {},
          settings: typeof data.form.settings === "string" ? JSON.parse(data.form.settings) : data.form.settings || {},
        };
        setActiveForm(formObj as any);
      }
    } catch (err) {
      console.error("Error fetching form details:", err);
    }
  };

  const fetchSubmissions = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/forms/${formId}/responses`);
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions);
      }
    } catch (err) {
      console.error("Error fetching responses list:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedSubmission) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/forms/${formId}/responses`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: selectedSubmission.id,
          status: newStatus,
          statusComment,
        }),
      });

      if (res.ok) {
        // Update local state
        const updated = submissions.map((sub) => {
          if (sub.id === selectedSubmission.id) {
            return { ...sub, status: newStatus, statusComment };
          }
          return sub;
        });
        setSubmissions(updated);
        setSelectedSubmission({
          ...selectedSubmission,
          status: newStatus,
          statusComment,
        });
        setStatusComment("");
      }
    } catch (err) {
      console.error("Error updating tracking workflow status:", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // CSV Export logic
  const handleExportCSV = () => {
    if (!activeForm || submissions.length === 0) return;

    // Header fields
    const headers = ["Submission ID", "Submitted Date", "Workflow Status", "Feedback Notes"];
    activeForm.fields.forEach((f) => {
      headers.push(f.label || f.id);
    });

    const csvRows = [headers.join(",")];

    submissions.forEach((sub) => {
      const row = [
        sub.customId,
        new Date(sub.createdAt).toLocaleDateString("en-IN"),
        sub.status,
        `"${(sub.statusComment || "").replace(/"/g, '""')}"`,
      ];

      activeForm.fields.forEach((f) => {
        const ans = sub.answers[f.id];
        let displayAns = "";
        if (ans !== undefined && ans !== null) {
          if (Array.isArray(ans)) {
            displayAns = ans.join(" | ");
          } else {
            displayAns = String(ans);
          }
        }
        row.push(`"${displayAns.replace(/"/g, '""')}"`);
      });

      csvRows.push(row.join(","));
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeForm.slug}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Search Filter
  const filteredSubmissions = submissions.filter((sub) => {
    const textToSearch = [
      sub.customId,
      sub.status,
      ...Object.values(sub.answers).map((v) => (Array.isArray(v) ? v.join(" ") : String(v))),
    ]
      .join(" ")
      .toLowerCase();

    return textToSearch.includes(searchQuery.toLowerCase());
  });

  // ANALYTICS COMPUTATIONS
  // 1. Completion status counts
  const statusCounts = submissions.reduce(
    (acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    },
    { Submitted: 0, "Under Review": 0, Approved: 0, Rejected: 0 } as Record<string, number>
  );

  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];

  // 2. Submissions over time (Grouped by date)
  const dateCounts = submissions.reduce((acc, curr) => {
    const dateStr = new Date(curr.createdAt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    });
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const timeData = Object.entries(dateCounts)
    .reverse()
    .map(([date, count]) => ({ date, submissions: count }));

  // 3. Question specific charts (e.g. choice distributions)
  // Let's find choice fields
  const choiceFields = activeForm?.fields.filter((f) => ["dropdown", "radio", "checkbox"].includes(f.type)) || [];
  
  // Computes frequencies for choices
  const getFieldChoiceDistribution = (fieldId: string) => {
    const dist: Record<string, number> = {};
    submissions.forEach((sub) => {
      const val = sub.answers[fieldId];
      if (!val) return;
      if (Array.isArray(val)) {
        val.forEach((v) => { dist[v] = (dist[v] || 0) + 1; });
      } else {
        dist[val] = (dist[val] || 0) + 1;
      }
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  };

  // 4. Rating averages
  const ratingFields = activeForm?.fields.filter((f) => f.type === "rating") || [];
  const getRatingAverage = (fieldId: string) => {
    let sum = 0;
    let count = 0;
    submissions.forEach((sub) => {
      const val = Number(sub.answers[fieldId]);
      if (!isNaN(val) && val > 0) {
        sum += val;
        count++;
      }
    });
    return count > 0 ? (sum / count).toFixed(1) : "N/A";
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <span className="text-xs font-black tracking-widest uppercase text-slate-400">Loading Responses...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Overview Head */}
      <div className="flex justify-between items-center select-none">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
            Responses Dashboard
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
            Total submissions: {submissions.length} | Views: {activeForm?.views || 0}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchSubmissions}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-border/80 bg-card text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer disabled:opacity-50"
            title="Refresh submissions"
          >
            <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          </button>
          
          <button
            onClick={handleExportCSV}
            disabled={submissions.length === 0}
            className="flex items-center gap-1.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider px-4 py-2.5 shadow-md shadow-primary/20 hover:scale-[1.02] disabled:opacity-50 cursor-pointer duration-200"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-border/50 select-none">
        <button
          onClick={() => setActiveTab("analytics")}
          className={cn(
            "py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-colors",
            activeTab === "analytics"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          Visual Analytics
        </button>
        <button
          onClick={() => setActiveTab("table")}
          className={cn(
            "py-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 cursor-pointer transition-colors",
            activeTab === "table"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          )}
        >
          Responses Grid ({filteredSubmissions.length})
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === "analytics" ? (
        submissions.length === 0 ? (
          <div className="crm-card bg-card border-border/80 p-16 text-center select-none">
            <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Responses Recieved</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">Once visitors submit responses to your public form, they will register here visually.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Visual Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Submission timeline chart */}
              <div className="lg:col-span-2 crm-card p-5 bg-card border-border flex flex-col h-80">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4">
                  Submissions Timeline
                </span>
                <div className="flex-1 w-full h-full text-xs font-semibold">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timeData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="submissions" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Status Timelines donut */}
              <div className="crm-card p-5 bg-card border-border flex flex-col h-80 items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block w-full mb-1">
                  Timeline Status Allocation
                </span>
                
                <div className="flex-1 w-full h-full relative flex items-center justify-center font-bold text-xs">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Total indicator inside donut */}
                  <div className="absolute text-center select-none">
                    <div className="text-xl font-black text-slate-800 dark:text-zinc-100">{submissions.length}</div>
                    <div className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold">Total</div>
                  </div>
                </div>

                {/* Status legends */}
                <div className="grid grid-cols-2 gap-4 text-[10px] font-extrabold w-full pt-4 border-t border-border/40">
                  {Object.entries(statusCounts).map(([k, v], idx) => (
                    <div key={k} className="flex items-center gap-1.5 truncate">
                      <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-slate-500 truncate">{k}:</span>
                      <span className="text-slate-800 dark:text-zinc-300 font-mono font-black">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Ratings and choice frequencies summaries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Choice lists frequency cards */}
              {choiceFields.slice(0, 4).map((field) => {
                const data = getFieldChoiceDistribution(field.id);
                return (
                  <div key={field.id} className="crm-card p-5 bg-card border-border">
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-4 truncate">
                      {field.label} Choice allocation
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {data.length === 0 ? (
                        <div className="text-xs text-slate-400 font-bold py-6 text-center select-none">No answers log data</div>
                      ) : (
                        data.map((item, idx) => {
                          const percent = ((item.value / submissions.length) * 100).toFixed(0);
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-slate-700 dark:text-zinc-200 truncate max-w-[200px]">{item.name}</span>
                                <span className="text-slate-400">{item.value} ({percent}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden border border-border/30">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Rating average cards */}
              {ratingFields.map((field) => {
                const avg = getRatingAverage(field.id);
                return (
                  <div key={field.id} className="crm-card p-5 bg-card border-border flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block truncate">
                        Rating Averages
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 mt-1.5 truncate max-w-[200px]">
                        {field.label}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-center">
                        <div className="text-2xl font-black text-amber-500 font-mono leading-none">{avg}</div>
                        <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold mt-1">Out of 5</div>
                      </div>
                      <Star className="h-8 w-8 text-amber-500 fill-amber-500 animate-float" />
                    </div>
                  </div>
                );
              })}

            </div>

          </div>
        )
      ) : (
        /* TAB CONTENT: RESPONSES GRID TABLE */
        <div className="crm-card bg-card border-border overflow-hidden">
          
          {/* Table Search filters */}
          <div className="p-4 border-b border-border/50 flex gap-4 select-none bg-slate-50/20 dark:bg-[#121625]/20">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search answers, tracking reference ID, workflow status..."
                className="w-full pl-11 pr-4 py-2 rounded-xl bg-card border border-border focus:border-primary/50 text-xs font-semibold outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Grid table */}
          {filteredSubmissions.length === 0 ? (
            <div className="p-16 text-center text-xs font-bold text-slate-400 select-none">
              No matching submission records found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/40 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
                    <th className="px-6 py-4">Reference ID</th>
                    <th className="px-6 py-4">Submission Date</th>
                    <th className="px-6 py-4">Answers Preview</th>
                    <th className="px-6 py-4">Workflow Status</th>
                    <th className="px-6 py-4 text-right">View Detail</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-xs font-semibold">
                  {filteredSubmissions.map((sub) => {
                    const dateStr = new Date(sub.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                    });

                    // Construct answers summary snippet
                    const answerSnippets: string[] = [];
                    activeForm?.fields.slice(0, 3).forEach((f) => {
                      const ans = sub.answers[f.id];
                      if (ans !== undefined && ans !== null) {
                        answerSnippets.push(`${f.label}: ${Array.isArray(ans) ? ans.join(", ") : ans}`);
                      }
                    });

                    return (
                      <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors">
                        {/* Reference ID */}
                        <td className="px-6 py-4 font-mono font-extrabold text-slate-800 dark:text-zinc-100">
                          {sub.customId}
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>{dateStr}</span>
                          </div>
                        </td>

                        {/* Snippets */}
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-400 max-w-[280px] truncate">
                          {answerSnippets.join(" | ") || "No responses provided"}
                        </td>

                        {/* Workflow Status */}
                        <td className="px-6 py-4 select-none">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border flex items-center gap-1 w-fit",
                            sub.status === "Submitted" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                            sub.status === "Under Review" && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                            sub.status === "Approved" && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                            sub.status === "Rejected" && "bg-rose-500/10 text-rose-500 border-rose-500/20"
                          )}>
                            {sub.status === "Submitted" && <Clock className="h-3 w-3" />}
                            {sub.status === "Under Review" && <AlertCircle className="h-3 w-3" />}
                            {sub.status === "Approved" && <CheckCircle2 className="h-3 w-3" />}
                            {sub.status === "Rejected" && <XCircle className="h-3 w-3" />}
                            <span>{sub.status}</span>
                          </span>
                        </td>

                        {/* Action details */}
                        <td className="px-6 py-4 text-right select-none">
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setNewStatus(sub.status);
                            }}
                            className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-primary hover:underline cursor-pointer"
                          >
                            <span>Open Details</span>
                            <ChevronRight className="h-3 w-3" />
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
      )}

      {/* SUBMISSION DRAWER DETAIL PANEL */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => !updatingStatus && setSelectedSubmission(null)} />

          <div className="w-full max-w-[480px] h-full bg-card border-l border-border relative z-10 shadow-2xl p-6 flex flex-col max-h-screen animate-fadeIn duration-300">
            {/* Header drawer */}
            <div className="flex justify-between items-center border-b border-border/40 pb-4 select-none">
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider font-mono">Submission Details</span>
                <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100">{selectedSubmission.customId}</h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="h-8 w-8 rounded-lg border border-border/80 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content body answers */}
            <div className="flex-1 overflow-y-auto mt-6 space-y-5 pr-1 text-xs">
              
              {/* Question list */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                  Logged Questions & Answers
                </span>
                
                {activeForm?.fields.map((field) => {
                  const val = selectedSubmission.answers[field.id];
                  let displayVal = "Not provided";
                  let isSignature = field.type === "signature" && val;
                  let isFile = field.type === "file" && val;

                  if (val !== undefined && val !== null && val !== "") {
                    if (Array.isArray(val)) {
                      displayVal = val.join(", ");
                    } else {
                      displayVal = String(val);
                    }
                  }

                  return (
                    <div key={field.id} className="p-3 bg-slate-50/50 dark:bg-[#121625]/20 rounded-xl border border-border/40 space-y-1">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{field.label}</div>
                      
                      {isSignature ? (
                        <div className="bg-white p-2 rounded-lg border border-zinc-200 mt-1 max-w-[200px]">
                          <img src={val} alt="Digital Signature" className="h-10 object-contain mx-auto" />
                        </div>
                      ) : isFile ? (
                        <a
                          href={val}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary hover:underline font-extrabold mt-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>Download Attachment File</span>
                        </a>
                      ) : (
                        <div className="font-bold text-slate-800 dark:text-zinc-200 whitespace-pre-wrap mt-0.5">{displayVal}</div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Status Timelines Updator */}
              <div className="pt-5 border-t border-border/40 space-y-4">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest block">
                  Workflow Tracking Status
                </span>

                {/* Status Dropdowns selector */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Timeline State</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="premium-input text-xs"
                  >
                    <option value="Submitted">Submitted (Initial)</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved / Completed</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Optional Status Comment */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Status Feedback Note</label>
                  <textarea
                    value={statusComment}
                    onChange={(e) => setStatusComment(e.target.value)}
                    placeholder="Provide comments/feedback notes to display to applicant..."
                    className="premium-input text-xs h-16 resize-none"
                  />
                  {selectedSubmission.statusComment && (
                    <div className="text-[10px] text-slate-400 font-medium italic mt-1 flex gap-1 items-start">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>Current note: "{selectedSubmission.statusComment}"</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || (newStatus === selectedSubmission.status && !statusComment.trim())}
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider hover:opacity-90 disabled:opacity-40 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>{updatingStatus ? "Updating..." : "Update Application Status"}</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
