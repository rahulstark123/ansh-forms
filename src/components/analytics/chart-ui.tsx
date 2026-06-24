"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const CHART_COLORS = {
  views: "#0ea5e9",
  responses: "#10b981",
  accent: "#8b5cf6",
  amber: "#f59e0b",
};

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; color?: string; dataKey?: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-lg text-xs">
      {label && <p className="mb-1.5 font-bold text-slate-700 dark:text-zinc-200">{label}</p>}
      {payload.map((entry) => (
        <div key={`${entry.name}-${entry.dataKey}`} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-slate-500 capitalize">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            {entry.name ?? entry.dataKey}
          </span>
          <span className="font-mono font-bold text-slate-800 dark:text-zinc-100">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={cn("crm-card bg-card border-border p-5 flex flex-col", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-800 dark:text-zinc-100 tracking-tight">{title}</h3>
          {subtitle && <p className="text-[11px] font-semibold text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

export function HorizontalBarRows({
  items,
  color,
  formatValue,
}: {
  items: { name: string; value: number }[];
  color: string;
  formatValue: (v: number) => string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.name} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="truncate font-semibold text-slate-600 dark:text-zinc-300" title={item.name}>
              {item.name}
            </span>
            <span className="shrink-0 font-mono font-bold text-slate-800 dark:text-zinc-100">
              {formatValue(item.value)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.value / max) * 100}%`, backgroundColor: color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DonutCenter({ total, label }: { total: number | string; label: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-2xl font-black text-slate-800 dark:text-zinc-100">{total}</span>
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
    </div>
  );
}
