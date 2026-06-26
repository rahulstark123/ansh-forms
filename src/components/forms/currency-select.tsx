"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CURRENCY_OPTIONS, formatCurrencyLabel, getCurrencyByCode } from "@/lib/currencies";

interface CurrencySelectProps {
  value: string;
  onChange: (code: string, symbol: string) => void;
}

export function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = getCurrencyByCode(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCY_OPTIONS;
    return CURRENCY_OPTIONS.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0);
    } else {
      setQuery("");
    }
  }, [open]);

  const pick = (code: string) => {
    const opt = getCurrencyByCode(code);
    onChange(opt.code, opt.symbol);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 rounded-xl border bg-card px-3 py-2.5 text-left text-xs font-bold text-slate-700 dark:text-zinc-200 cursor-pointer transition-colors",
          open ? "border-primary/50 ring-1 ring-primary/20" : "border-border hover:border-primary/30"
        )}
      >
        <span className="truncate">{formatCurrencyLabel(selected)}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-fadeIn">
          <div className="p-2 border-b border-border/50">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search code or name..."
                className="w-full pl-8 pr-3 py-2 rounded-lg border border-border/60 bg-slate-50/80 dark:bg-zinc-900/40 text-xs font-semibold outline-none focus:border-primary/40"
              />
            </div>
          </div>

          <ul className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-3 py-4 text-center text-[11px] font-semibold text-slate-400">
                No currencies match your search
              </li>
            ) : (
              filtered.map((c) => {
                const isSelected = c.code === selected.code;
                return (
                  <li key={c.code}>
                    <button
                      type="button"
                      onClick={() => pick(c.code)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold cursor-pointer transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary"
                          : "text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                      )}
                    >
                      <span className="truncate">{formatCurrencyLabel(c)}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
