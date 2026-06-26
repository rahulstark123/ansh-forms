"use client";

import React from "react";
import { Star, Upload, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { SignaturePad } from "@/components/forms/signature-pad";
import { getCurrencySymbol } from "@/lib/currencies";
import { isDisplayOnlyField } from "@/config/form-fields";

export interface FormFieldShape {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
  scaleMin?: number;
  scaleMax?: number;
  scaleMinLabel?: string;
  scaleMaxLabel?: string;
  currencyCode?: string;
  currencySymbol?: string;
}

interface FormFieldInputProps {
  field: FormFieldShape;
  value: unknown;
  onChange: (fieldId: string, value: unknown) => void;
  onCheckboxChange?: (fieldId: string, option: string, checked: boolean) => void;
  onFileUpload?: (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadingFieldId?: string | null;
  fileUploadNote?: string;
}

function ScaleInput({
  field,
  value,
  onChange,
}: {
  field: FormFieldShape;
  value: unknown;
  onChange: (fieldId: string, value: unknown) => void;
}) {
  const min = field.scaleMin ?? 1;
  const max = field.scaleMax ?? 10;
  const points = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  return (
    <div className="space-y-2 pt-1 select-none">
      <div className="flex flex-wrap gap-1.5">
        {points.map((point) => (
          <button
            key={point}
            type="button"
            onClick={() => onChange(field.id, point)}
            className={cn(
              "h-9 w-9 rounded-lg border text-xs font-black transition-all cursor-pointer",
              value === point
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "border-border bg-slate-50 hover:border-primary/40 text-slate-600"
            )}
          >
            {point}
          </button>
        ))}
      </div>
      {(field.scaleMinLabel || field.scaleMaxLabel) && (
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          <span>{field.scaleMinLabel || min}</span>
          <span>{field.scaleMaxLabel || max}</span>
        </div>
      )}
    </div>
  );
}

export function FormFieldInput({
  field,
  value,
  onChange,
  onCheckboxChange,
  onFileUpload,
  uploadingFieldId,
  fileUploadNote,
}: FormFieldInputProps) {
  if (isDisplayOnlyField(field.type)) {
    return (
      <div className="pt-1 pb-2 border-b border-border/60">
        <h3 className="text-sm font-black text-slate-800 tracking-tight">{field.label}</h3>
        {field.placeholder && (
          <p className="text-[11px] text-slate-500 font-semibold mt-1 leading-relaxed">{field.placeholder}</p>
        )}
      </div>
    );
  }

  const requiredStar = field.required ? <span className="text-rose-500 font-black">*</span> : null;

  return (
    <div className="space-y-1.5 text-left">
      {field.type !== "consent" && (
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
          {field.label} {requiredStar}
        </label>
      )}

      {field.type === "textarea" ? (
        <textarea
          value={(value as string) || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="premium-input text-xs h-24 resize-none"
          required={field.required}
        />
      ) : field.type === "dropdown" ? (
        <select
          value={(value as string) || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          className="premium-input text-xs"
          required={field.required}
        >
          <option value="">{field.placeholder || "Select an option"}</option>
          {field.options?.map((opt, oIdx) => (
            <option key={oIdx} value={opt}>{opt}</option>
          ))}
        </select>
      ) : field.type === "radio" ? (
        <div className="space-y-2 select-none pt-1">
          {field.options?.map((opt, oIdx) => (
            <label key={oIdx} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="radio"
                name={field.id}
                value={opt}
                checked={value === opt}
                onChange={() => onChange(field.id, opt)}
                className="h-4.5 w-4.5 text-primary border-slate-300 focus:ring-primary/20"
                required={field.required && !value}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ) : field.type === "checkbox" ? (
        <div className="space-y-2 select-none pt-1">
          {field.options?.map((opt, oIdx) => (
            <label key={oIdx} className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(opt)}
                onChange={(e) => onCheckboxChange?.(field.id, opt, e.target.checked)}
                className="rounded border-slate-350 text-primary focus:ring-primary/20 h-4.5 w-4.5"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ) : field.type === "rating" ? (
        <div className="flex gap-2 text-slate-300 pt-1 select-none">
          {[1, 2, 3, 4, 5].map((star) => {
            const active = star <= Number(value || 0);
            return (
              <button
                key={star}
                type="button"
                onClick={() => onChange(field.id, star)}
                className={cn("hover:scale-110 cursor-pointer duration-200", active ? "text-amber-400" : "text-slate-200")}
              >
                <Star className={cn("h-7 w-7", active && "fill-current")} />
              </button>
            );
          })}
        </div>
      ) : field.type === "scale" ? (
        <ScaleInput field={field} value={value} onChange={onChange} />
      ) : field.type === "toggle" ? (
        <div className="flex items-center gap-3 pt-1 select-none">
          <button
            type="button"
            onClick={() => onChange(field.id, value === true ? false : true)}
            className={cn(
              "w-12 h-6.5 rounded-full p-1 transition-colors duration-200 cursor-pointer",
              value === true ? "bg-emerald-500" : "bg-slate-300"
            )}
          >
            <div className={cn(
              "bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-200",
              value === true ? "translate-x-5.5" : "translate-x-0"
            )} />
          </button>
          <span className="text-xs font-bold text-slate-700">
            {value === true ? "Yes" : value === false ? "No" : "Select an option"}
          </span>
        </div>
      ) : field.type === "consent" ? (
        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(field.id, e.target.checked)}
            className="rounded border-slate-350 text-primary focus:ring-primary/20 h-4.5 w-4.5 mt-0.5 shrink-0"
            required={field.required}
          />
          <span className="text-xs font-semibold text-slate-700 leading-relaxed">
            {field.placeholder || field.label} {requiredStar}
          </span>
        </label>
      ) : field.type === "currency" ? (
        <div className="flex w-full overflow-hidden rounded-xl border border-border bg-card/50 transition-all focus-within:border-primary focus-within:shadow-[0_0_0_1.5px_color-mix(in_srgb,var(--primary)_18%,transparent)]">
          <span className="inline-flex items-center justify-center px-3 py-2.5 text-xs font-black text-slate-500 bg-slate-50/80 border-r border-border shrink-0 min-w-[3rem]">
            {getCurrencySymbol(field.currencyCode, field.currencySymbol || "₹")}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={(value as string) || ""}
            onChange={(e) => onChange(field.id, e.target.value)}
            placeholder="0.00"
            className="flex-1 min-w-0 border-0 bg-transparent px-3 py-2.5 text-xs font-semibold text-foreground outline-none placeholder:text-slate-400"
            required={field.required}
          />
        </div>
      ) : field.type === "file" ? (
        <div className="space-y-2 select-none">
          {value ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs font-bold text-emerald-600">
                <div className="flex items-center gap-2 truncate">
                  <ShieldCheck className="h-4.5 w-4.5 text-emerald-500" />
                  <span className="truncate">File Uploaded Successfully</span>
                </div>
                <button
                  type="button"
                  onClick={() => onChange(field.id, "")}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer"
                >
                  Clear
                </button>
              </div>
              {fileUploadNote && (
                <p className="text-[9px] font-semibold text-slate-400">{fileUploadNote}</p>
              )}
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                onChange={(e) => onFileUpload?.(field.id, e)}
                className="hidden"
                id={`file_input_${field.id}`}
                disabled={uploadingFieldId === field.id}
              />
              <label
                htmlFor={`file_input_${field.id}`}
                className="w-full flex flex-col items-center justify-center py-4 rounded-xl border border-dashed border-border/80 hover:border-primary/50 cursor-pointer bg-slate-50/50 hover:bg-slate-100/50 text-[10px] font-black uppercase text-slate-400 tracking-wider transition-all"
              >
                {uploadingFieldId === field.id ? (
                  <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-1" />
                ) : (
                  <Upload className="h-5 w-5 mb-1.5 text-slate-400" />
                )}
                                  <span>{uploadingFieldId === field.id ? "Compressing & uploading..." : "Choose File Attachment"}</span>
              </label>
            </div>
          )}
        </div>
      ) : field.type === "signature" ? (
        <SignaturePad
          value={(value as string) || null}
          onChange={(dataUrl) => onChange(field.id, dataUrl || "")}
        />
      ) : (
        <input
          type={
            field.type === "phone" ? "tel"
              : field.type === "url" ? "url"
                : field.type === "datetime" ? "datetime-local"
                  : field.type
          }
          value={(value as string) || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
          placeholder={field.placeholder}
          className="premium-input text-xs"
          required={field.required}
        />
      )}
    </div>
  );
}
