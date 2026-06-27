"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUIStore } from "@/stores/ui-store";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Download, Search, Clock, Calendar, CheckCircle2, AlertCircle, XCircle,
  RefreshCw, X, ChevronRight, MessageSquare, Star, TrendingUp, Inbox
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrencySymbol } from "@/lib/currencies";
import {
  CHART_COLORS,
  ChartCard,
  ChartTooltip,
  DonutCenter,
} from "@/components/analytics/chart-ui";
import { Portal } from "@/components/ui/portal";

const AXIS_TICK = { fontSize: 10, fontWeight: 600, fill: "var(--muted-foreground)" };
const GRID_STROKE = "var(--border)";
const STATUS_COLORS = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444"];
const CHOICE_COLORS = [CHART_COLORS.responses, CHART_COLORS.views, CHART_COLORS.accent, CHART_COLORS.amber, "#ec4899", "#06b6d4"];

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
  const requiresApproval = activeForm?.settings?.requiresApproval === true;

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
    const headers = ["Submission ID", "Submitted Date"];
    if (requiresApproval) {
      headers.push("Workflow Status", "Feedback Notes");
    }
    activeForm.fields.forEach((f) => {
      headers.push(f.label || f.id);
    });

    const csvRows = [headers.join(",")];

    submissions.forEach((sub) => {
      const row = [
        sub.customId,
        new Date(sub.createdAt).toLocaleDateString("en-IN"),
      ];
      if (requiresApproval) {
        row.push(
          sub.status,
          `"${(sub.statusComment || "").replace(/"/g, '""')}"`,
        );
      }

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
  // 1. Completion status counts (approval forms only)
  const statusCounts = requiresApproval
    ? submissions.reduce(
        (acc, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        },
        { Submitted: 0, "Under Review": 0, Approved: 0, Rejected: 0 } as Record<string, number>
      )
    : null;

  const statusData = statusCounts ? Object.entries(statusCounts).map(([name, value]) => ({ name, value })) : [];

  // 2. Submissions over time (chronological)
  const timeData = (() => {
    const buckets = new Map<string, { count: number; ts: number }>();
    submissions.forEach((sub) => {
      const d = new Date(sub.createdAt);
      const key = d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
      const dayTs = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, { count: 1, ts: dayTs });
      }
    });
    return Array.from(buckets.entries())
      .map(([date, { count, ts }]) => ({ date, submissions: count, ts }))
      .sort((a, b) => a.ts - b.ts)
      .map(({ date, submissions }) => ({ date, submissions }));
  })();

  const last7Days = submissions.filter((sub) => {
    const diff = Date.now() - new Date(sub.createdAt).getTime();
    return diff <= 7 * 24 * 60 * 60 * 1000;
  }).length;

  const approvalRate =
    requiresApproval && statusCounts
      ? Math.round(((statusCounts.Approved || 0) / Math.max(submissions.length, 1)) * 100)
      : null;

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

  const getRatingDistribution = (fieldId: string, maxRating: number) => {
    const dist: Record<number, number> = {};
    for (let i = 1; i <= maxRating; i++) dist[i] = 0;
    submissions.forEach((sub) => {
      const val = Number(sub.answers[fieldId]);
      if (!isNaN(val) && val >= 1 && val <= maxRating) {
        dist[val] = (dist[val] || 0) + 1;
      }
    });
    return Object.entries(dist).map(([name, value]) => ({ name, value }));
  };

  // 4. Rating averages
  const ratingFields = activeForm?.fields.filter((f) => ["rating", "scale"].includes(f.type)) || [];
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
            {/* KPI summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="crm-card p-5 bg-card border-border">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Responses</span>
                  <Inbox className="h-4 w-4 text-emerald-500" />
                </div>
                <h2 className="text-3xl font-black text-emerald-500 mt-3">{submissions.length}</h2>
                <p className="text-[10px] font-semibold text-slate-400 mt-2">All time submissions</p>
              </div>
              <div className="crm-card p-5 bg-card border-border">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Last 7 Days</span>
                  <TrendingUp className="h-4 w-4 text-sky-500" />
                </div>
                <h2 className="text-3xl font-black text-sky-500 mt-3">{last7Days}</h2>
                <p className="text-[10px] font-semibold text-slate-400 mt-2">Recent activity</p>
              </div>
              <div className="crm-card p-5 bg-card border-border">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Form Views</span>
                  <Star className="h-4 w-4 text-violet-500" />
                </div>
                <h2 className="text-3xl font-black text-violet-500 mt-3">{activeForm?.views || 0}</h2>
                <p className="text-[10px] font-semibold text-slate-400 mt-2">Public page visits</p>
              </div>
              {approvalRate !== null ? (
                <div className="crm-card p-5 bg-card border-border">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Approval Rate</span>
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                  </div>
                  <h2 className="text-3xl font-black text-amber-500 mt-3">{approvalRate}%</h2>
                  <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${approvalRate}%` }} />
                  </div>
                </div>
              ) : (
                <div className="crm-card p-5 bg-card border-border">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg / Day</span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-3xl font-black text-primary mt-3">
                    {timeData.length > 0
                      ? (submissions.length / timeData.length).toFixed(1)
                      : "0"}
                  </h2>
                  <p className="text-[10px] font-semibold text-slate-400 mt-2">Across active days</p>
                </div>
              )}
            </div>

            {/* Main charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard
                className={cn(requiresApproval ? "lg:col-span-2" : "lg:col-span-full", "h-auto")}
                title="Submissions Over Time"
                subtitle="Daily response trend"
              >
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="responsesTimeline" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={CHART_COLORS.responses} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={CHART_COLORS.responses} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} opacity={0.5} />
                      <XAxis dataKey="date" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="submissions"
                        name="Responses"
                        stroke={CHART_COLORS.responses}
                        fill="url(#responsesTimeline)"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: CHART_COLORS.responses, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              {requiresApproval && statusCounts && (
                <ChartCard title="Workflow Status" subtitle="Approval pipeline breakdown">
                  <div className="relative h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          innerRadius={58}
                          outerRadius={78}
                          paddingAngle={4}
                          dataKey="value"
                          nameKey="name"
                        >
                          {statusData.map((_, index) => (
                            <Cell key={`status-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <DonutCenter total={submissions.length} label="Total" />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 border-t border-border/40 pt-3">
                    {Object.entries(statusCounts).map(([k, v], idx) => (
                      <div key={k} className="flex items-center gap-1.5 text-[10px] font-bold">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[idx] }} />
                        <span className="text-slate-500 truncate">{k}</span>
                        <span className="ml-auto font-mono text-slate-800 dark:text-zinc-200">{v}</span>
                      </div>
                    ))}
                  </div>
                </ChartCard>
              )}
            </div>

            {/* Field-level charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {choiceFields.slice(0, 4).map((field, fieldIdx) => {
                const data = getFieldChoiceDistribution(field.id);
                const pieData = data.slice(0, 6);
                return (
                  <ChartCard
                    key={field.id}
                    title={field.label}
                    subtitle="Answer distribution"
                  >
                    {data.length === 0 ? (
                      <p className="py-10 text-center text-xs font-bold text-slate-400">No answers yet</p>
                    ) : data.length <= 4 ? (
                      <div className="relative h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius={48}
                              outerRadius={72}
                              paddingAngle={3}
                            >
                              {pieData.map((_, idx) => (
                                <Cell key={`${field.id}-${idx}`} fill={CHOICE_COLORS[(fieldIdx + idx) % CHOICE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip content={<ChartTooltip />} />
                            <Legend wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={data.slice(0, 8)}
                            margin={{ top: 4, right: 12, left: 4, bottom: 4 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={GRID_STROKE} opacity={0.5} />
                            <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              tick={AXIS_TICK}
                              axisLine={false}
                              tickLine={false}
                              width={88}
                            />
                            <Tooltip content={<ChartTooltip />} />
                            <Bar
                              dataKey="value"
                              name="Responses"
                              fill={CHOICE_COLORS[fieldIdx % CHOICE_COLORS.length]}
                              radius={[0, 6, 6, 0]}
                              maxBarSize={18}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </ChartCard>
                );
              })}

              {ratingFields.map((field) => {
                const maxRating = field.type === "scale" ? (field.scaleMax ?? 10) : 5;
                const dist = getRatingDistribution(field.id, maxRating);
                const avg = getRatingAverage(field.id);
                return (
                  <ChartCard
                    key={field.id}
                    title={field.label}
                    subtitle={`Average: ${avg} / ${maxRating}`}
                  >
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dist} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} opacity={0.5} />
                          <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={32} allowDecimals={false} />
                          <Tooltip content={<ChartTooltip />} />
                          <Bar
                            dataKey="value"
                            name="Count"
                            fill={CHART_COLORS.amber}
                            radius={[6, 6, 0, 0]}
                            maxBarSize={36}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </ChartCard>
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
                placeholder={requiresApproval ? "Search answers, tracking reference ID, workflow status..." : "Search answers or reference ID..."}
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
                    {requiresApproval && <th className="px-6 py-4">Workflow Status</th>}
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
                        {requiresApproval && (
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
                        )}

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
        <Portal>
          <div className="fixed inset-0 z-[200]">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => !updatingStatus && setSelectedSubmission(null)}
            />

            <div className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col min-h-0 bg-card border-l border-border shadow-2xl animate-fadeIn duration-300">
              {/* Header drawer */}
              <div className="flex shrink-0 justify-between items-center border-b border-border/40 px-6 py-4 select-none">
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
              <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-5 text-xs">
              
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
                    if (field.type === "toggle") {
                      displayVal = val === true ? "Yes" : val === false ? "No" : "Not provided";
                    } else if (field.type === "consent") {
                      displayVal = val === true ? "Agreed" : "Not agreed";
                    } else if (field.type === "currency") {
                      const sym = getCurrencySymbol(field.currencyCode, field.currencySymbol || "₹");
                      displayVal = `${sym}${val}`;
                    } else if (Array.isArray(val)) {
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

              {/* Status Timelines Updator — approval forms only */}
              {requiresApproval && (
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
              )}

              </div>
            </div>
          </div>
        </Portal>
      )}
    </div>
  );
}
