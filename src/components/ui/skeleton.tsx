import React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200",
        "dark:from-slate-800 dark:via-slate-700/80 dark:to-slate-800",
        "animate-shimmer bg-[length:200%_100%]",
        className
      )}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="crm-card p-5 bg-card border-border shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4.5 w-4.5 rounded-md" />
      </div>
      <div className="flex items-baseline gap-2 mt-4">
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function FormCardSkeleton() {
  return (
    <div className="crm-card bg-card border-border p-6.5 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-20 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
        <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl border border-border/40 bg-slate-50/50 dark:bg-slate-900/30">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <Skeleton className="h-2.5 w-10" />
              <Skeleton className="h-5 w-8" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-6">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

export function FormTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="crm-card bg-card border-border overflow-hidden">
      <div className="border-b border-border/50 bg-slate-50/50 dark:bg-[#121625]/40 px-5 py-3.5 flex gap-6">
        {["w-32", "w-20", "w-16", "w-12", "w-16", "w-12", "w-14"].map((w, i) => (
          <Skeleton key={i} className={cn("h-3", w)} />
        ))}
      </div>
      <div className="divide-y divide-border/30">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-6">
            <div className="flex-1 min-w-0 space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-5 w-16 rounded shrink-0" />
            <Skeleton className="h-5 w-20 rounded shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-4 w-10 shrink-0" />
            <Skeleton className="h-7 w-7 rounded-lg shrink-0 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ResponseTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto flex-1 p-1">
      <div className="border-b border-border/30 px-5 py-3 flex gap-8">
        {["w-36", "w-40", "w-16", "w-14"].map((w, i) => (
          <Skeleton key={i} className={cn("h-2.5", w)} />
        ))}
      </div>
      <div className="divide-y divide-border/20">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-8">
            <div className="space-y-1.5 w-[150px] shrink-0">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-2.5 w-20" />
            </div>
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3 w-48" />
              <Skeleton className="h-2.5 w-24" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full shrink-0" />
            <Skeleton className="h-3 w-12 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopFormsSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3.5 flex-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between gap-4 border-b border-border/40 pb-3 last:border-0 last:pb-0">
          <div className="space-y-1.5 max-w-[140px] flex-1">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <div className="flex gap-4">
            <div className="space-y-1 text-right">
              <Skeleton className="h-3 w-8 ml-auto" />
              <Skeleton className="h-2 w-14 ml-auto" />
            </div>
            <div className="space-y-1 text-right">
              <Skeleton className="h-3 w-10 ml-auto" />
              <Skeleton className="h-2 w-16 ml-auto" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ tall = false, className }: { tall?: boolean; className?: string }) {
  return (
    <div className={cn("crm-card bg-card border-border p-5 flex flex-col", className)}>
      <div className="space-y-1.5 mb-4">
        <Skeleton className="h-3.5 w-36" />
        <Skeleton className="h-2.5 w-48" />
      </div>
      <Skeleton className={cn("w-full rounded-xl", tall ? "h-72" : "h-40")} />
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="crm-card p-5 bg-card border-border flex flex-col">
            <div className="flex justify-between items-start">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="h-9 w-20 mt-3" />
            <Skeleton className="h-10 w-full mt-3 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCardSkeleton tall className="lg:col-span-2" />
        <ChartCardSkeleton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCardSkeleton tall />
        <ChartCardSkeleton />
        <ChartCardSkeleton />
      </div>
    </>
  );
}
