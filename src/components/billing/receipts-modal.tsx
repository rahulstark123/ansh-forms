"use client";

import React, { useEffect, useState } from "react";
import { Portal } from "@/components/ui/portal";
import { X, Download, Receipt, Calendar, CreditCard, Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";

type ReceiptItem = {
  id: string;
  receiptNumber: string;
  invoiceNumber: string;
  amountMinor: number;
  currency: string;
  fileUrl: string;
  gatewayOrderId: string;
  gatewayPaymentId: string | null;
  issuedAt: string;
};

interface ReceiptsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptsModal({ isOpen, onClose }: ReceiptsModalProps) {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchReceipts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient("/api/billing/receipts");
        if (!res.ok) {
          throw new Error("Failed to fetch receipts");
        }
        const data = await res.json();
        setReceipts(data.receipts || []);
      } catch (err: unknown) {
        console.error("Fetch receipts modal error:", err);
        setError(err instanceof Error ? err.message : "Failed to load receipts.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipts();
  }, [isOpen]);

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatAmount = (minor: number, currency: string) => {
    const val = minor / 100;
    const symbol = currency.toUpperCase() === "INR" ? "₹" : "$";
    return `${symbol}${val.toFixed(2)}`;
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm animate-fadeIn">
        <div 
          className="relative w-full max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl p-6 overflow-hidden flex flex-col max-h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 pb-4 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight">Billing History &amp; Receipts</h3>
                <p className="text-xs text-zinc-500">Download invoices and receipts generated for your subscription.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.open("/api/billing/receipts/sample", "_blank")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-amber-500/50 hover:bg-amber-500/5 text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 transition-all hover:scale-102 cursor-pointer"
                title="Download a mock receipt PDF to preview formatting"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Test Receipt</span>
              </button>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-3 text-xs font-semibold">Loading your receipts...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-red-500 text-center px-4">
                <p className="text-sm font-semibold">{error}</p>
                <button
                  onClick={() => onClose()}
                  className="mt-4 px-4 py-2 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-bold rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            ) : receipts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-500 text-center px-4">
                <div className="h-12 w-12 rounded-full border border-zinc-200 dark:border-zinc-850 flex items-center justify-center mb-3">
                  <CreditCard className="h-6 w-6 text-zinc-400" />
                </div>
                <p className="text-sm font-bold text-zinc-850 dark:text-zinc-300">No receipts found</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">Receipts will be generated here automatically after you purchase a Pro plan.</p>
              </div>
            ) : (
              <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900/50 text-[10px] font-black uppercase text-zinc-400 tracking-wider border-b border-zinc-200 dark:border-zinc-850">
                      <th className="px-4 py-3">Receipt Number</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850">
                    {receipts.map((rcpt) => (
                      <tr 
                        key={rcpt.id}
                        className="text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                      >
                        <td className="px-4 py-3.5 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                          {rcpt.receiptNumber}
                        </td>
                        <td className="px-4 py-3.5 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-zinc-450 shrink-0" />
                            <span>{formatDate(rcpt.issuedAt)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                          {formatAmount(rcpt.amountMinor, rcpt.currency)}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => window.open(`/api/billing/receipts/${rcpt.id}`, "_blank")}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-primary/50 dark:hover:border-primary/50 text-zinc-600 dark:text-zinc-400 hover:text-primary dark:hover:text-primary transition-all font-semibold hover:scale-102"
                          >
                            <Download className="h-3.5 w-3.5" />
                            <span>PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
}
