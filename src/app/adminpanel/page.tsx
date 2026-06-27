"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  RefreshCw,
  Send,
  Loader2,
  Ticket,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";

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
  category: string;
  priority: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  replies?: SupportReply[];
  _count?: { replies: number };
}

interface Stats {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
}

const STATUS_FILTERS = ["All", "Open", "In Progress", "Resolved", "Closed"] as const;
const STATUSES: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

function statusColor(status: TicketStatus) {
  switch (status) {
    case "Open":
      return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    case "In Progress":
      return "bg-sky-500/15 text-sky-400 border-sky-500/25";
    case "Resolved":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    case "Closed":
      return "bg-zinc-500/15 text-zinc-400 border-zinc-500/25";
  }
}

function formatWhen(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPanelPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("forms@anshapps.com");
  const [password, setPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [showDashboard, setShowDashboard] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchStats = useCallback(async () => {
    const res = await fetch("/api/admin/stats");
    if (res.status === 401) {
      setIsLoggedIn(false);
      return;
    }
    if (res.ok) {
      const data = await res.json();
      setStats(data.stats);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const qs = statusFilter !== "All" ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const res = await fetch(`/api/admin/tickets${qs}`);
      if (res.status === 401) {
        setIsLoggedIn(false);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets);
      }
    } finally {
      setLoadingTickets(false);
    }
  }, [statusFilter]);

  const fetchTicketDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/tickets/${id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedTicket(data.ticket);
      }
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => {
        setIsLoggedIn(res.ok);
        setAuthChecked(true);
      })
      .catch(() => {
        setIsLoggedIn(false);
        setAuthChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchTickets();
    fetchStats();
  }, [isLoggedIn, fetchTickets, fetchStats]);

  useEffect(() => {
    if (selectedId && isLoggedIn) fetchTicketDetail(selectedId);
    else setSelectedTicket(null);
  }, [selectedId, isLoggedIn, fetchTicketDetail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed.");
        return;
      }

      setPassword("");
      setIsLoggedIn(true);
    } catch {
      setLoginError("Unable to connect. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    setIsLoggedIn(false);
    setSelectedId(null);
    setSelectedTicket(null);
    setTickets([]);
    setStats(null);
  };

  const handleSendReply = async () => {
    if (!selectedId || !replyText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyText.trim() }),
      });
      if (res.ok) {
        setReplyText("");
        await fetchTicketDetail(selectedId);
        await fetchTickets();
        await fetchStats();
      }
    } finally {
      setSending(false);
    }
  };

  const handleStatusChange = async (status: TicketStatus) => {
    if (!selectedId) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/tickets/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchTicketDetail(selectedId);
        await fetchTickets();
        await fetchStats();
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <Image src="/logoAnshapps.png" alt="ANSH Apps" width={48} height={48} className="h-12 w-12 object-contain mb-4" />
            <h1 className="text-xl font-black tracking-tight">Admin Panel</h1>
            <p className="text-xs text-zinc-400 font-semibold mt-1">ANSH Forms support desk</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500/50"
                required
              />
            </div>

            {loginError && (
              <p className="text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-black uppercase tracking-wider hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loginLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              <span>{loginLoading ? "Signing in..." : "Sign In"}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="shrink-0 border-b border-white/10 bg-zinc-900/80 px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Image src="/logoAnshapps.png" alt="Logo" width={32} height={32} className="h-8 w-8 object-contain shrink-0" />
          <div className="min-w-0">
            <h1 className="text-sm font-black tracking-tight truncate">Support Admin</h1>
            <p className="text-[10px] text-zinc-500 font-semibold truncate">{email}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowDashboard(true)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-wider hover:bg-white/10"
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Dashboard
          </button>
          <button
            onClick={() => { fetchTickets(); fetchStats(); if (selectedId) fetchTicketDetail(selectedId); }}
            className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-zinc-400" />
          </button>
          <button
            onClick={handleLogout}
            className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-rose-500/10 hover:border-rose-500/30"
            title="Logout"
          >
            <LogOut className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-full max-w-sm shrink-0 border-r border-white/10 flex flex-col min-h-0">
          <div className="p-3 border-b border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-violet-400" />
              <span className="text-xs font-black uppercase tracking-wider">Tickets</span>
              <span className="ml-auto text-[10px] font-bold text-zinc-500">{tickets.length}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={cn(
                    "px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors",
                    statusFilter === f
                      ? "bg-violet-500/15 text-violet-300 border-violet-500/30"
                      : "border-white/10 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingTickets ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
              </div>
            ) : tickets.length === 0 ? (
              <p className="p-6 text-xs text-zinc-500 font-semibold text-center">No tickets found.</p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  onClick={() => setSelectedId(ticket.id)}
                  className={cn(
                    "w-full text-left p-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors",
                    selectedId === ticket.id && "bg-violet-500/10 border-l-2 border-l-violet-500"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono font-bold text-violet-400">{ticket.ticketId}</span>
                    <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border", statusColor(ticket.status))}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-zinc-100 line-clamp-1">{ticket.subject}</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{ticket.name} · {ticket.email}</p>
                  <div className="flex items-center gap-2 mt-2 text-[9px] text-zinc-600 font-semibold">
                    <MessageSquare className="h-3 w-3" />
                    <span>{ticket._count?.replies ?? 0} replies</span>
                    <span>·</span>
                    <span>{formatWhen(ticket.updatedAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="flex-1 min-w-0 flex flex-col min-h-0">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <MessageSquare className="h-10 w-10 text-zinc-700 mb-3" />
              <p className="text-sm font-bold text-zinc-400">Select a ticket to view and reply</p>
            </div>
          ) : loadingDetail ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
            </div>
          ) : (
            <>
              <div className="shrink-0 p-5 border-b border-white/10 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-violet-400">{selectedTicket.ticketId}</span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase">{selectedTicket.category}</span>
                      <span className="text-[9px] font-bold text-zinc-500">· {selectedTicket.priority} priority</span>
                    </div>
                    <h2 className="text-lg font-black text-white">{selectedTicket.subject}</h2>
                    <p className="text-xs text-zinc-400 mt-1">{selectedTicket.name} &lt;{selectedTicket.email}&gt;</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTicket.status}
                      disabled={updatingStatus}
                      onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                      className="rounded-xl border border-white/10 bg-zinc-950 px-3 py-2 text-xs font-bold outline-none focus:border-violet-500/50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {selectedTicket.description && (
                  <div className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1">Original message</p>
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">{selectedTicket.description}</p>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-5 space-y-3">
                {(selectedTicket.replies ?? []).length === 0 ? (
                  <p className="text-xs text-zinc-500 font-semibold">No replies yet. Send the first response below.</p>
                ) : (
                  selectedTicket.replies!.map((reply) => (
                    <div
                      key={reply.id}
                      className={cn(
                        "max-w-[85%] min-w-0 rounded-2xl px-4 py-3 border",
                        reply.isAdmin
                          ? "ml-auto bg-violet-500/15 border-violet-500/25"
                          : "mr-auto bg-zinc-900 border-white/10"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-black text-zinc-300">
                          {reply.authorName || reply.authorEmail}
                        </span>
                        <span className="text-[9px] text-zinc-500">{formatWhen(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-zinc-200 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{reply.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="shrink-0 p-4 border-t border-white/10 bg-zinc-900/50">
                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply to the customer..."
                    rows={3}
                    className="flex-1 rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-medium outline-none focus:border-violet-500/50 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={sending || !replyText.trim()}
                    className="self-end rounded-xl bg-violet-600 px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-violet-500 disabled:opacity-50 flex items-center gap-2"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Reply
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {showDashboard && stats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="absolute inset-0" onClick={() => setShowDashboard(false)} />
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-violet-400" />
                Support Dashboard
              </h2>
              <button onClick={() => setShowDashboard(false)} className="h-8 w-8 rounded-lg border border-white/10 flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Open", value: stats.open, color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                { label: "In Progress", value: stats.inProgress, color: "text-sky-400 bg-sky-500/10 border-sky-500/20" },
                { label: "Resolved", value: stats.resolved, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
                { label: "Closed", value: stats.closed, color: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20" },
              ].map((item) => (
                <div key={item.label} className={cn("rounded-xl border p-4 text-center", item.color)}>
                  <p className="text-3xl font-black">{item.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-wider mt-1 opacity-80">{item.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-black text-white">{stats.total}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mt-1">Total Tickets</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
