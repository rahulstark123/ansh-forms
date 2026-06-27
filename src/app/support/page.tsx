"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  X,
  Loader2,
  Send,
  RefreshCw,
  Tag,
  Flame,
  MessageSquare,
} from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type TicketPriority = "Low" | "Medium" | "High" | "Critical";
type TicketCategory =
  | "General"
  | "Billing"
  | "Technical"
  | "Feature Request"
  | "Bug";

interface SupportReply {
  id: string;
  message: string;
  isAdmin: boolean;
  authorEmail: string;
  authorName: string;
  createdAt: string;
}

interface SupportTicket {
  id: string;
  ticketId: string;
  email: string;
  name: string;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  replies?: SupportReply[];
  _count?: { replies: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function statusConfig(status: TicketStatus) {
  switch (status) {
    case "Open":
      return {
        label: "Open",
        icon: AlertCircle,
        classes:
          "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50",
      };
    case "In Progress":
      return {
        label: "In Progress",
        icon: Clock,
        classes:
          "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/50",
      };
    case "Resolved":
      return {
        label: "Resolved",
        icon: CheckCircle2,
        classes:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50",
      };
    case "Closed":
      return {
        label: "Closed",
        icon: XCircle,
        classes:
          "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700",
      };
  }
}

function priorityConfig(priority: TicketPriority) {
  switch (priority) {
    case "Low":
      return {
        label: "Low",
        classes: "text-slate-500 dark:text-slate-400",
        dot: "bg-slate-400",
      };
    case "Medium":
      return {
        label: "Medium",
        classes: "text-blue-600 dark:text-blue-400",
        dot: "bg-blue-500",
      };
    case "High":
      return {
        label: "High",
        classes: "text-orange-600 dark:text-orange-400",
        dot: "bg-orange-500",
      };
    case "Critical":
      return {
        label: "Critical",
        classes: "text-rose-600 dark:text-rose-400",
        dot: "bg-rose-500",
      };
  }
}

function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Create Ticket Modal
// ─────────────────────────────────────────────────────────────────────────────

interface CreateTicketModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  defaultEmail: string;
  defaultName: string;
}

const CATEGORIES: TicketCategory[] = [
  "General",
  "Billing",
  "Technical",
  "Feature Request",
  "Bug",
];
const PRIORITIES: TicketPriority[] = ["Low", "Medium", "High", "Critical"];

function CreateTicketModal({
  open,
  onClose,
  onCreated,
  defaultEmail,
  defaultName,
}: CreateTicketModalProps) {
  const [form, setForm] = useState({
    name: defaultName,
    email: defaultEmail,
    subject: "",
    description: "",
    category: "General" as TicketCategory,
    priority: "Medium" as TicketPriority,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync defaults when modal opens
  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, name: defaultName, email: defaultEmail }));
      setError("");
    }
  }, [open, defaultEmail, defaultName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.subject.trim()) {
      setError("Please enter a subject.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create ticket.");
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-card border border-border/80 rounded-2xl shadow-2xl animate-fadeIn overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Ticket className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground">
                Create Support Ticket
              </h2>
              <p className="text-[10px] text-muted-foreground font-semibold">
                Our team usually responds within 24 hours
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Your Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
              placeholder="Brief description of your issue..."
              className="w-full rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Category
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value as TicketCategory })
                  }
                  className="w-full appearance-none rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                Priority
              </label>
              <div className="relative">
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as TicketPriority })
                  }
                  className="w-full appearance-none rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all cursor-pointer"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Description{" "}
              <span className="normal-case font-semibold text-muted-foreground/60">
                (optional)
              </span>
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={4}
              placeholder="Describe your issue in detail — steps to reproduce, screenshots, etc."
              className="w-full resize-none rounded-xl border border-border/70 bg-background px-3 py-2.5 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 px-4 py-3">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
              <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                {error}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-border py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-2.5 text-sm font-bold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Ticket Detail Drawer
// ─────────────────────────────────────────────────────────────────────────────

function TicketDrawer({
  ticket,
  onClose,
  onUpdated,
}: {
  ticket: SupportTicket | null;
  onClose: () => void;
  onUpdated?: () => void;
}) {
  const [detail, setDetail] = useState<SupportTicket | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const loadDetail = useCallback(async (t: SupportTicket) => {
    setLoadingReplies(true);
    try {
      const res = await fetch(`/api/support/${t.id}?email=${encodeURIComponent(t.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.ticket) setDetail(data.ticket);
      }
    } catch {
      // keep existing detail
    } finally {
      setLoadingReplies(false);
    }
  }, []);

  useEffect(() => {
    if (!ticket) {
      setDetail(null);
      setMessageText("");
      setSendError(null);
      return;
    }

    setDetail(ticket);
    setMessageText("");
    setSendError(null);
    loadDetail(ticket);
  }, [ticket, loadDetail]);

  const handleSendMessage = async () => {
    if (!detail || !messageText.trim()) return;

    setSending(true);
    setSendError(null);

    try {
      const res = await fetch(`/api/support/${detail.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText.trim(),
          email: detail.email,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || "Failed to send message.");
        return;
      }

      setMessageText("");
      await loadDetail(detail);
      onUpdated?.();
    } catch {
      setSendError("Unable to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (!ticket || !detail) return null;

  const st = statusConfig(detail.status);
  const pr = priorityConfig(detail.priority);
  const StatusIcon = st.icon;
  const replies = detail.replies ?? [];
  const canChat = detail.status !== "Closed";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-[480px] bg-card border-l border-border/80 shadow-2xl z-50 flex flex-col animate-slideInRight overflow-hidden">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Support Chat
            </p>
            <h3 className="text-sm font-black text-foreground mt-0.5 truncate">
              {detail.ticketId} · {detail.subject}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Meta strip */}
        <div className="shrink-0 px-6 py-3 border-b border-border/40 flex flex-wrap gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold", st.classes)}>
            <StatusIcon className="h-3 w-3" />
            {st.label}
          </span>
          <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold bg-muted/60 border border-border/50", pr.classes)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", pr.dot)} />
            {pr.label}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold bg-muted/60 border border-border/50 text-muted-foreground">
            <Tag className="h-3 w-3" />
            {detail.category}
          </span>
        </div>

        {/* Chat thread */}
        <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-4 space-y-3 bg-muted/10">
          {loadingReplies && replies.length === 0 ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {detail.description && (
                <div className="flex w-full min-w-0 justify-end">
                  <div className="max-w-[85%] min-w-0 rounded-2xl rounded-br-md border border-border/50 bg-primary/10 px-4 py-3 space-y-1">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <p className="text-[10px] font-black text-foreground truncate">{detail.name}</p>
                      <p className="text-[9px] text-muted-foreground font-semibold shrink-0">{timeAgo(detail.createdAt)}</p>
                    </div>
                    <p className="text-sm text-foreground font-semibold whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                      {detail.description}
                    </p>
                  </div>
                </div>
              )}

              {replies.length === 0 && !detail.description && (
                <div className="rounded-xl border border-dashed border-border/60 p-5 text-center space-y-2">
                  <MessageSquare className="h-6 w-6 text-muted-foreground/50 mx-auto" />
                  <p className="text-xs font-bold text-muted-foreground">Start the conversation</p>
                  <p className="text-[10px] text-muted-foreground/70 font-semibold">
                    Send a message below and our team will reply here.
                  </p>
                </div>
              )}

              {replies.map((reply) => (
                <div key={reply.id} className={cn("flex w-full min-w-0", reply.isAdmin ? "justify-start" : "justify-end")}>
                  <div
                    className={cn(
                      "max-w-[85%] min-w-0 rounded-2xl px-4 py-3 space-y-1",
                      reply.isAdmin
                        ? "rounded-bl-md border border-primary/25 bg-primary/5"
                        : "rounded-br-md border border-border/50 bg-primary/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <p className="text-[10px] font-black text-foreground truncate">
                        {reply.isAdmin ? reply.authorName || "ANSH Support" : reply.authorName || "You"}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-semibold shrink-0">
                        {timeAgo(reply.createdAt)}
                      </p>
                    </div>
                    <p className="text-sm text-foreground font-semibold whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
                      {reply.message}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Chat composer */}
        {canChat ? (
          <div className="shrink-0 border-t border-border/50 bg-card p-4 space-y-2">
            {sendError && (
              <p className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {sendError}
              </p>
            )}
            <div className="flex gap-2">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                rows={2}
                className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold outline-none focus:border-primary/50 resize-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={sending || !messageText.trim()}
                className="self-end h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-50 shrink-0"
                title="Send message"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-[9px] text-muted-foreground font-semibold text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        ) : (
          <div className="shrink-0 border-t border-border/50 bg-muted/30 p-4 text-center">
            <p className="text-xs font-bold text-muted-foreground">This ticket is closed</p>
            <p className="text-[10px] text-muted-foreground/70 font-semibold mt-1">
              Open a new ticket if you need more help.
            </p>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Support Page
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_FILTERS: Array<TicketStatus | "All"> = [
  "All",
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

export default function SupportPage() {
  const user = useUIStore((state) => state.user);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<TicketStatus | "All">("All");
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const email = user?.email || "";
        const res = await fetch(
          `/api/support${email ? `?email=${encodeURIComponent(email)}` : ""}`
        );
        const data = await res.json();
        setTickets(data.tickets || []);
      } catch (err) {
        console.error("Failed to fetch tickets:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [user?.email]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filtered = tickets.filter((t) => {
    const matchStatus = statusFilter === "All" || t.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.ticketId.toLowerCase().includes(q) ||
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  // Stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "Open").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    resolved: tickets.filter(
      (t) => t.status === "Resolved" || t.status === "Closed"
    ).length,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-border/50">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-black text-foreground tracking-tight">
                Support Center
              </h1>
              <p className="text-xs text-muted-foreground font-semibold">
                Track and manage your support requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchTickets(true)}
              disabled={refreshing}
              className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh tickets"
            >
              <RefreshCw
                className={cn("h-4 w-4", refreshing && "animate-spin")}
              />
            </button>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          {[
            {
              label: "Total Tickets",
              value: stats.total,
              icon: Ticket,
              color: "text-slate-600 dark:text-slate-400",
              bg: "bg-slate-100 dark:bg-slate-800/60",
            },
            {
              label: "Open",
              value: stats.open,
              icon: AlertCircle,
              color: "text-amber-600 dark:text-amber-400",
              bg: "bg-amber-50 dark:bg-amber-950/40",
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: Clock,
              color: "text-blue-600 dark:text-blue-400",
              bg: "bg-blue-50 dark:bg-blue-950/40",
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: CheckCircle2,
              color: "text-emerald-600 dark:text-emerald-400",
              bg: "bg-emerald-50 dark:bg-emerald-950/40",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3"
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center",
                    stat.bg
                  )}
                >
                  <Icon className={cn("h-4 w-4", stat.color)} />
                </div>
                <div>
                  <p className="text-lg font-black text-foreground leading-none">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-border/30 flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-border/60 bg-card font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>

        {/* Status Filter tabs */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 border border-border/40">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                statusFilter === s
                  ? "bg-card text-foreground shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
              <p className="text-sm text-muted-foreground font-semibold">
                Loading tickets…
              </p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center">
              <Ticket className="h-7 w-7 text-muted-foreground/50" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-sm font-black text-foreground">
                {tickets.length === 0
                  ? "No tickets yet"
                  : "No matching tickets"}
              </p>
              <p className="text-xs text-muted-foreground font-semibold">
                {tickets.length === 0
                  ? "Click \"New Ticket\" to submit your first support request."
                  : "Try adjusting your search or filter."}
              </p>
            </div>
            {tickets.length === 0 && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer shadow-md shadow-primary/20"
              >
                <Plus className="h-4 w-4" />
                Create Ticket
              </button>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/40">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Ticket ID
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Subject
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Priority
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((ticket) => {
                  const st = statusConfig(ticket.status);
                  const pr = priorityConfig(ticket.priority);
                  const StatusIcon = st.icon;

                  return (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="hover:bg-muted/40 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-black text-primary text-xs tracking-wide">
                          {ticket.ticketId}
                        </span>
                      </td>

                      {/* Subject */}
                      <td className="px-4 py-3.5 max-w-[220px]">
                        <p className="font-bold text-foreground truncate text-xs group-hover:text-primary transition-colors">
                          {ticket.subject}
                        </p>
                        {ticket.description && (
                          <p className="text-[10px] text-muted-foreground font-semibold truncate mt-0.5">
                            {ticket.description}
                          </p>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {ticket.category}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 text-xs font-bold",
                            pr.classes
                          )}
                        >
                          {ticket.priority === "Critical" && (
                            <Flame className="h-3 w-3" />
                          )}
                          {ticket.priority !== "Critical" && (
                            <span
                              className={cn("h-1.5 w-1.5 rounded-full", pr.dot)}
                            />
                          )}
                          {pr.label}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
                            st.classes
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {st.label}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-muted-foreground font-semibold">
                          {timeAgo(ticket.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-border/30 bg-muted/20 flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground">
                Showing {filtered.length} of {tickets.length} ticket
                {tickets.length !== 1 ? "s" : ""}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground">
                Click a row to view details
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <CreateTicketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={() => fetchTickets(true)}
        defaultEmail={user?.email || ""}
        defaultName={user?.name || user?.email?.split("@")[0] || ""}
      />

      <TicketDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onUpdated={() => fetchTickets(true)}
      />
    </div>
  );
}
