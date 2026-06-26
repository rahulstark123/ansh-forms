"use client";

import React, { useEffect, useState } from "react";
import { Check, Copy, Download, QrCode, X } from "lucide-react";
import { Portal } from "@/components/ui/portal";
import { getFormPublicUrl } from "@/lib/form-public-url";
import { useWorkspaceSlug } from "@/hooks/use-workspace-slug";
import { downloadFormQrPng, downloadFormQrSvg, generateFormQrDataUrl } from "@/lib/form-qr";

interface FormQrModalProps {
  open: boolean;
  onClose: () => void;
  formTitle: string;
  slug: string;
}

export function FormQrModal({ open, onClose, formTitle, slug }: FormQrModalProps) {
  const companySlug = useWorkspaceSlug();
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState<"png" | "svg" | null>(null);

  const publicUrl = companySlug ? getFormPublicUrl(companySlug, slug) : "";
  const safeFilename = slug.replace(/[^a-z0-9-]/gi, "-") || "form-qr";

  useEffect(() => {
    if (!open || !publicUrl) {
      setQrDataUrl(null);
      setCopied(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    generateFormQrDataUrl(publicUrl)
      .then((dataUrl) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch((err) => console.error("QR generation failed:", err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, publicUrl]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPng = async () => {
    setDownloading("png");
    try {
      await downloadFormQrPng(publicUrl, `${safeFilename}-qr.png`);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadSvg = async () => {
    setDownloading("svg");
    try {
      await downloadFormQrSvg(publicUrl, `${safeFilename}-qr.svg`);
    } finally {
      setDownloading(null);
    }
  };

  if (!open) return null;

  return (
    <Portal>
      <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/55 p-4">
        <div className="absolute inset-0" onClick={onClose} aria-hidden />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl p-6 animate-fadeInDown">
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary shrink-0" />
                <h2 className="text-lg font-black text-slate-800 dark:text-zinc-100 tracking-tight truncate">
                  Form QR Code
                </h2>
              </div>
              <p className="text-[11px] text-slate-400 font-semibold mt-1 truncate">{formTitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-lg border border-border/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col items-center">
            <div className="rounded-2xl border border-border/80 bg-white p-4 shadow-sm">
              {loading || !qrDataUrl ? (
                <div className="h-[220px] w-[220px] flex items-center justify-center">
                  <div className="h-8 w-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${formTitle}`}
                  width={220}
                  height={220}
                  className="h-[220px] w-[220px] object-contain"
                />
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold mt-3 text-center">
              Scan to open the live form and submit a response
            </p>
          </div>

          <div className="mt-5 space-y-2">
            <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
              Public form link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={publicUrl}
                className="flex-1 min-w-0 rounded-xl border border-border bg-slate-50 dark:bg-slate-900/40 px-3 py-2 text-[11px] font-mono text-slate-700 dark:text-zinc-300 outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-2 rounded-xl border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={loading || downloading !== null}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloading === "png" ? "Saving..." : "PNG"}</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadSvg}
              disabled={loading || downloading !== null}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-[10px] font-black uppercase tracking-wider hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>{downloading === "svg" ? "Saving..." : "SVG"}</span>
            </button>
          </div>
        </div>
      </div>
    </Portal>
  );
}
