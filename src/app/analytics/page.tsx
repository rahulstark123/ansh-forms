"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Eye,
  Inbox,
  TrendingUp,
  FileText,
  Search,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { isUiOnlyMode } from "@/lib/draft-form";
import { MOCK_ANALYTICS, MOCK_TREND_DATA } from "@/lib/analytics-mock";
import {
  CHART_COLORS,
  ChartCard,
  ChartTooltip,
  HorizontalBarRows,
} from "@/components/analytics/chart-ui";
import type { AnalyticItem } from "./types";

const AXIS_TICK = { fontSize: 10, fontWeight: 600, fill: "var(--muted-foreground)" };
const GRID_STROKE = "var(--border)";

function computeSummary(items: AnalyticItem[]) {
  const formsOnly = items.filter((x) => !x.isLandingPage);
  const totalViews = formsOnly.reduce((acc, curr) => acc + curr.views, 0);
  const totalResponses = formsOnly.reduce((acc, curr) => acc + curr.responses, 0);
  const avgConversion = totalViews > 0 ? Math.round((totalResponses / totalViews) * 1000) / 10 : 0;
  const formsCount = formsOnly.length;
  return { totalViews, totalResponses, avgConversion, formsCount };
}

function shortLabel(title: string, max = 14) {
  return title.length > max ? `${title.slice(0, max - 1)}…` : title;
}

export default function AnalyticsPage() {
  const router = useRouter();
  useUIStore((state) => state.user);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/forms");
      if (res.ok) {
        const json = await res.json();
        const formsList = json.forms || [];
        const parsedData: AnalyticItem[] = formsList.map((f: Record<string, unknown>) => {
          const s =
            typeof f.settings === "string"
              ? JSON.parse(f.settings)
              : (f.settings as Record<string, unknown>) || {};
          const count = f._count as { submissions?: number } | undefined;
          const responsesCount = count?.submissions || 0;
          const views = (f.views as number) || 0;
          return {
            id: f.id as string,
            title: f.title as string,
            slug: f.slug as string,
            views,
            isLandingPage: !!s.isLandingPage,
            responses: responsesCount,
            conversion: views > 0 ? Math.round((responsesCount / views) * 1000) / 10 : 0,
            createdAt: f.createdAt as string,
          };
        });
        setData(parsedData.length === 0 && isUiOnlyMode() ? MOCK_ANALYTICS : parsedData);
      } else if (isUiOnlyMode()) {
        setData(MOCK_ANALYTICS);
      }
    } catch (err) {
      console.error("Failed to load analytics data:", err);
      if (isUiOnlyMode()) setData(MOCK_ANALYTICS);
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => computeSummary(data), [data]);
  const formsData = useMemo(() => data.filter((x) => !x.isLandingPage), [data]);

  const filteredData = formsData.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const chartData = formsData
    .sort((a, b) => b.views - a.views)
    .slice(0, 6)
    .map((item) => ({
      name: shortLabel(item.title),
      views: item.views,
      responses: item.responses,
    }));

  const conversionBands = [
    { name: "High (20%+)", value: formsData.filter((x) => x.conversion >= 20).length, color: CHART_COLORS.responses },
    { name: "Medium (5-20%)", value: formsData.filter((x) => x.conversion >= 5 && x.conversion < 20).length, color: CHART_COLORS.views },
    { name: "Low (<5%)", value: formsData.filter((x) => x.conversion < 5).length, color: CHART_COLORS.amber },
  ].filter((x) => x.value > 0);

  const topByViews = [...formsData]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
    .map((item) => ({ name: item.title, value: item.views }));

  const topByConversion = [...formsData]
    .filter((x) => x.views > 0)
    .sort((a, b) => b.conversion - a.conversion)
    .slice(0, 5)
    .map((item) => ({ name: item.title, value: item.conversion }));

  const trendData = MOCK_TREND_DATA.map((d) => ({
    month: d.month,
    views: d.Views,
    responses: d.Responses,
  }));

  const sparkViews = trendData.map((d) => ({ x: d.month, y: d.views }));
  const sparkResponses = trendData.map((d) => ({ x: d.month, y: d.responses }));

  if (!mounted) return null;

  return (
    <div className="space-y-8 animate-fadeIn text-left">
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span>Workspace Analytics</span>
        </h1>
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-1">
          Conversion trends, traffic performance, and response breakdowns.
        </p>
      </div>

      {loading ? (
        <div className="crm-card bg-card border-border/70 p-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <span className="text-xs font-bold text-slate-400">Analyzing form metrics...</span>
        </div>
      ) : data.length === 0 ? (
        <div className="crm-card bg-card border-border p-16 text-center space-y-4">
          <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-zinc-300">No Analytics Available</h3>
          <p className="text-xs text-slate-400">Create forms and receive responses to view charts.</p>
        </div>
      ) : (
        <>
          {/* KPI row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Views", value: summary.totalViews.toLocaleString(), icon: Eye, color: "text-sky-500", spark: sparkViews, stroke: CHART_COLORS.views },
              { label: "Total Responses", value: summary.totalResponses.toLocaleString(), icon: Inbox, color: "text-emerald-500", spark: sparkResponses, stroke: CHART_COLORS.responses },
            ].map((m, idx) => (
              <div key={m.label} className="crm-card p-5 bg-card border-border flex flex-col">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{m.label}</span>
                  <m.icon className={cn("h-4 w-4", m.color)} />
                </div>
                <h2 className={cn("text-3xl font-black tracking-tight mt-3", m.color)}>{m.value}</h2>
                <div className="mt-3 h-10 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={m.spark} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`spark-${idx}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={m.stroke} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={m.stroke} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="y" stroke={m.stroke} fill={`url(#spark-${idx})`} strokeWidth={2} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
            <div className="crm-card p-5 bg-card border-border flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Avg Conversion</span>
                <TrendingUp className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-amber-500 mt-3">{summary.avgConversion}%</h2>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(summary.avgConversion, 100)}%` }} />
              </div>
            </div>
            <div className="crm-card p-5 bg-card border-border flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Forms</span>
                <FileText className="h-4 w-4 text-violet-500" />
              </div>
              <h2 className="text-3xl font-black tracking-tight text-violet-500 mt-3">{summary.formsCount}</h2>
              <p className="text-[10px] font-semibold text-slate-400 mt-2">Active forms tracked</p>
            </div>
          </div>

          {/* Main charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard
              className="lg:col-span-2"
              title="Traffic Performance"
              subtitle="Views vs submissions over time"
            >
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="viewsArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.views} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={CHART_COLORS.views} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="responsesArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.responses} stopOpacity={0.25} />
                        <stop offset="100%" stopColor={CHART_COLORS.responses} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} opacity={0.5} />
                    <XAxis dataKey="month" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                    <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={40} />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                    <Area type="monotone" dataKey="views" name="Views" stroke={CHART_COLORS.views} fill="url(#viewsArea)" strokeWidth={2.5} dot={false} />
                    <Area type="monotone" dataKey="responses" name="Responses" stroke={CHART_COLORS.responses} fill="url(#responsesArea)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Conversion Mix" subtitle="Form conversion distribution">
              <div className="space-y-3">
                {conversionBands.length === 0 ? (
                  <p className="py-10 text-center text-xs font-bold text-slate-400">No conversion data yet.</p>
                ) : (
                  <HorizontalBarRows
                    items={conversionBands.map((b) => ({ name: b.name, value: b.value }))}
                    color={CHART_COLORS.responses}
                    formatValue={(v) => `${v}`}
                  />
                )}
              </div>
              <div className="mt-2 space-y-2 border-t border-border/40 pt-3">
                {conversionBands.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-xs font-bold">
                    <span className="flex items-center gap-2 text-slate-500">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name}
                    </span>
                    <span className="font-mono text-slate-800 dark:text-zinc-100">{d.value}</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Secondary row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title="Top Forms" subtitle="Views vs responses (top 6)">
              {chartData.length === 0 ? (
                <p className="py-12 text-center text-xs font-bold text-slate-400">No data for this category.</p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -12, bottom: 0 }} barGap={4} barCategoryGap="22%">
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID_STROKE} opacity={0.5} />
                      <XAxis dataKey="name" tick={AXIS_TICK} axisLine={false} tickLine={false} interval={0} angle={-18} textAnchor="end" height={52} />
                      <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} width={36} />
                      <Tooltip content={<ChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
                      <Bar dataKey="views" name="Views" fill={CHART_COLORS.views} radius={[6, 6, 0, 0]} maxBarSize={28} />
                      <Bar dataKey="responses" name="Responses" fill={CHART_COLORS.responses} radius={[6, 6, 0, 0]} maxBarSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>

            <ChartCard title="Top Forms by Views" subtitle="Highest traffic forms">
              <HorizontalBarRows
                items={topByViews.length ? topByViews : [{ name: "No forms yet", value: 0 }]}
                color={CHART_COLORS.views}
                formatValue={(v) => v.toLocaleString()}
              />
            </ChartCard>

            <ChartCard title="Conversion Leaders" subtitle="Best performing by rate">
              <HorizontalBarRows
                items={topByConversion}
                color={CHART_COLORS.responses}
                formatValue={(v) => `${v}%`}
              />
            </ChartCard>
          </div>
        </>
      )}

      {!loading && data.length > 0 && (
        <div className="crm-card bg-card border-border overflow-hidden">
          <div className="p-5 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-xs font-black text-slate-800 dark:text-zinc-200 uppercase tracking-widest">
              Form Performance Register
            </h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets..."
                className="pl-9 pr-3 py-1.5 w-48 rounded-lg bg-slate-50 dark:bg-slate-900/30 border border-border text-xs font-semibold outline-none focus:border-primary/50"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            {filteredData.length === 0 ? (
              <div className="p-12 text-center text-xs font-bold text-slate-400">No matching assets found.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30 text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/20 dark:bg-slate-900/10">
                    <th className="px-6 py-3.5">Asset Details</th>
                    <th className="px-6 py-3.5 text-center">Page Views</th>
                    <th className="px-6 py-3.5 text-center">Submissions</th>
                    <th className="px-6 py-3.5 text-center">Conversion</th>
                    <th className="px-6 py-3.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-zinc-100 max-w-[240px] truncate">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {`/f/${item.slug}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-mono font-bold">{item.views}</td>
                      <td className="px-6 py-4 text-center font-mono font-bold">{item.responses}</td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={cn(
                            "font-mono font-bold",
                            item.conversion > 20 ? "text-emerald-500" : item.conversion > 5 ? "text-amber-500" : "text-rose-500"
                          )}
                        >
                          {item.conversion}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => router.push(`/forms/${item.id}/responses`)}
                          className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-primary hover:underline cursor-pointer"
                        >
                          Manage <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
