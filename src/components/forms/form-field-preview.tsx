"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FIELD_TYPES, isDisplayOnlyField } from "@/config/form-fields";
import { getCurrencySymbol } from "@/lib/currencies";
import type { FormFieldShape } from "@/components/forms/form-field-input";

interface FormFieldPreviewProps {
  field: FormFieldShape;
  className?: string;
}

export function FormFieldPreview({ field, className }: FormFieldPreviewProps) {
  if (isDisplayOnlyField(field.type)) {
    return (
      <div className={cn("pt-1 pb-2 border-b border-border/50", className)}>
        <div className="text-sm font-black text-slate-800 dark:text-zinc-100">{field.label}</div>
        {field.placeholder && (
          <p className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold mt-1">{field.placeholder}</p>
        )}
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={cn("builder-input-preview w-full h-12 rounded-lg border text-[11px] p-2 italic font-semibold", className)}>
        {field.placeholder}
      </div>
    );
  }

  if (["dropdown", "radio", "checkbox"].includes(field.type)) {
    return (
      <div className="space-y-1.5">
        {field.options?.map((opt, oIdx) => (
          <div key={oIdx} className="builder-option-text flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-300 font-bold">
            {field.type === "dropdown" && <span className="text-slate-400 dark:text-zinc-400 font-mono">{oIdx + 1}.</span>}
            {field.type === "radio" && <span className="h-3 w-3 rounded-full border border-slate-350 dark:border-zinc-500 block shrink-0" />}
            {field.type === "checkbox" && <span className="h-3 w-3 rounded border border-slate-350 dark:border-zinc-500 block shrink-0" />}
            <span>{opt}</span>
          </div>
        ))}
      </div>
    );
  }

  if (field.type === "rating") {
    return (
      <div className="flex gap-1 text-amber-400">
        {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4.5 w-4.5 fill-current" />)}
      </div>
    );
  }

  if (field.type === "scale") {
    const min = field.scaleMin ?? 1;
    const max = Math.min(field.scaleMax ?? 10, min + 9);
    return (
      <div className="flex flex-wrap gap-1 pt-1">
        {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
          <span key={n} className="h-7 w-7 rounded-md border border-border/60 flex items-center justify-center text-[10px] font-black text-slate-400">
            {n}
          </span>
        ))}
      </div>
    );
  }

  if (field.type === "toggle") {
    return (
      <div className="flex items-center gap-2 pt-1">
        <span className="w-10 h-5 rounded-full bg-slate-200 dark:bg-slate-700 block" />
        <span className="text-[10px] font-bold text-slate-400 italic">Yes / No</span>
      </div>
    );
  }

  if (field.type === "consent") {
    return (
      <label className="flex items-start gap-2 text-[10px] font-semibold text-slate-500 italic pt-1">
        <span className="h-3.5 w-3.5 rounded border border-slate-350 shrink-0 mt-0.5" />
        <span>{field.placeholder || field.label}</span>
      </label>
    );
  }

  if (field.type === "signature") {
    return (
      <div className={cn("builder-input-preview w-full h-16 rounded-xl border border-dashed flex items-center justify-center text-[10px] font-bold italic text-slate-400", className)}>
        E-Signature pad
      </div>
    );
  }

  if (field.type === "file") {
    return (
      <div className={cn("builder-input-preview w-full py-3 rounded-xl border border-dashed flex items-center justify-center text-[10px] font-bold italic text-slate-400", className)}>
        File upload area
      </div>
    );
  }

  if (field.type === "currency") {
    const symbol = getCurrencySymbol(field.currencyCode, field.currencySymbol || "₹");
    return (
      <div className={cn("builder-input-preview w-full rounded-lg border overflow-hidden flex text-[11px] font-semibold", className)}>
        <span className="inline-flex items-center justify-center px-3 py-2 bg-slate-50/80 border-r border-border/60 font-black text-slate-500 shrink-0 min-w-[3rem]">
          {symbol}
        </span>
        <span className="flex-1 px-3 py-2 text-slate-400 italic">0.00</span>
      </div>
    );
  }

  const config = FIELD_TYPES.find((f) => f.type === field.type);
  const previewText = field.placeholder || config?.label || field.type;

  return (
    <div className={cn("builder-input-preview w-full py-2 px-3 rounded-lg border text-[11px] italic font-semibold", className)}>
      {previewText}
    </div>
  );
}
