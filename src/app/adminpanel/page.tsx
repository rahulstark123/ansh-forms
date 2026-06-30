"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  CreditCard,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  RefreshCw,
  Send,
  Loader2,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
type AdminSection = "tickets" | "dashboard" | "subscriptions";
type BillingTab = "subscriptions" | "transactions";

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

interface SubscriptionRow {
  workspaceId: number;
  workspace: string;
  plan: string;
  status: string;
  seats: number;
  amount: number;
  amountDisplay: string;
  cycle: string;
  startsAt: string;
  expiresAt: string | null;
  transactions: number;
}

interface SubscriptionSummary {
  activeCount: number;
  totalCount: number;
  pendingCount: number;
  monthlyRecurring: number;
  monthlyRecurringDisplay: string;
  newThisMonth: number;
  cancelledOrExpired: number;
  avgSeats: number;
  activeWorkspaces: number;
}

interface TransactionRow {
  id: string;
  workspace: string;
  plan: string;
  amountDisplay: string;
  status: string;
  method: string;
  createdAt: string;
}

const STATUS_FILTERS = ["All", "Open", "In Progress", "Resolved", "Closed"] as const;
const STATUSES: TicketStatus[] = ["Open", "In Progress", "Resolved", "Closed"];

const NAV_ITEMS: { id: AdminSection; label: string; icon: typeof Ticket }[] = [
  { id: "tickets", label: "Support Tickets", icon: MessageSquare },
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "subscriptions", label: "Subscriptions", icon: CreditCard },
];

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

function subStatusColor(status: string) {
  switch (status) {
    case "Active":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
    case "Pending":
      return "bg-amber-500/15 text-amber-400 border-amber-500/25";
    case "Expired":
      return "bg-rose-500/15 text-rose-400 border-rose-500/25";
    default:
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

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AdminPanelPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("forms@anshapps.com");
  const [password, setPassword] = useState("");
  const [passcode, setPasscode] = useState("");
  const [pin, setPin] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<AdminSection>("tickets");
  const [billingTab, setBillingTab] = useState<BillingTab>("subscriptions");

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [replyText, setReplyText] = useState("");
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([]);
  const [subSummary, setSubSummary] = useState<SubscriptionSummary | null>(null);
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(false);

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

  const fetchBilling = useCallback(async () => {
    setLoadingBilling(true);
    try {
      const [subRes, txnRes] = await Promise.all([
        fetch("/api/admin/subscriptions"),
        fetch("/api/admin/transactions"),
      ]);
      if (subRes.status === 401 || txnRes.status === 401) {
        setIsLoggedIn(false);
        return;
      }
      if (subRes.ok) {
        const data = await subRes.json();
        setSubscriptions(data.subscriptions);
        setSubSummary(data.summary);
      }
      if (txnRes.ok) {
        const data = await txnRes.json();
        setTransactions(data.transactions);
      }
    } finally {
      setLoadingBilling(false);
    }
  }, []);

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
    fetchBilling();
  }, [isLoggedIn, fetchTickets, fetchStats, fetchBilling]);

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
        body: JSON.stringify({ email, password, passcode, pin }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Login failed.");
        return;
      }

      setPassword("");
      setPasscode("");
      setPin("");
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
    setSubscriptions([]);
    setSubSummary(null);
    setTransactions([]);
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

  const handleRefresh = () => {
    fetchTickets();
    fetchStats();
    fetchBilling();
    if (selectedId) fetchTicketDetail(selectedId);
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

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter passcode"
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-semibold outline-none focus:border-violet-500/50"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-zinc-400">PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter PIN"
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
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 border-r border-white/10 bg-zinc-900/60 flex flex-col">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <Image src="/logoAnshapps.png" alt="Logo" width={28} height={28} className="h-7 w-7 object-contain" />
            <div>
              <p className="text-xs font-black tracking-tight">ANSH Admin</p>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Support Desk</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-colors",
                  active
                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col min-h-screen">
        {activeSection === "tickets" && (
          <div className="flex flex-1 min-h-0 flex-col">
            <header className="shrink-0 border-b border-white/10 bg-zinc-900/40 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-base font-black tracking-tight flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-violet-400" />
                  Support Tickets
                </h1>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Manage customer support requests</p>
              </div>
              <button
                onClick={handleRefresh}
                className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-zinc-400" />
              </button>
            </header>

            <div className="flex flex-1 min-h-0">
              <div className="w-full max-w-sm shrink-0 border-r border-white/10 flex flex-col min-h-0">
                <div className="p-3 border-b border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
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
              </div>

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
          </div>
        )}

        {activeSection === "dashboard" && stats && (
          <div className="flex-1 p-6 md:p-8">
            <div className="mb-6">
              <h1 className="text-base font-black tracking-tight flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4 text-violet-400" />
                Support Dashboard
              </h1>
              <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Ticket overview and metrics</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl">
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

            <div className="mt-4 max-w-xs rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center">
              <p className="text-2xl font-black text-white">{stats.total}</p>
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mt-1">Total Tickets</p>
            </div>
          </div>
        )}

        {activeSection === "subscriptions" && (
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-base font-black tracking-tight flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-violet-400" />
                  Subscriptions &amp; Transactions
                </h1>
                <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">All workspace billing activity</p>
              </div>
              <button
                onClick={handleRefresh}
                className="h-9 w-9 rounded-xl border border-white/10 flex items-center justify-center hover:bg-white/5 shrink-0"
                title="Refresh"
              >
                <RefreshCw className="h-4 w-4 text-zinc-400" />
              </button>
            </div>

            <div className="flex gap-1 mb-6 border-b border-white/10">
              {(["subscriptions", "transactions"] as BillingTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBillingTab(tab)}
                  className={cn(
                    "px-4 py-2.5 text-xs font-black uppercase tracking-wider border-b-2 -mb-px transition-colors",
                    billingTab === tab
                      ? "text-violet-300 border-violet-500"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  )}
                >
                  {tab === "subscriptions" ? "Subscriptions" : "Transactions"}
                </button>
              ))}
            </div>

            {loadingBilling ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              </div>
            ) : billingTab === "subscriptions" ? (
              <>
                {subSummary && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                    {[
                      {
                        label: "Active Subscriptions",
                        value: String(subSummary.activeCount),
                        sub: `${subSummary.totalCount} total · ${subSummary.pendingCount} pending`,
                      },
                      {
                        label: "Monthly Recurring",
                        value: subSummary.monthlyRecurringDisplay,
                        sub: "From active plans (monthly equiv.)",
                      },
                      {
                        label: "New This Month",
                        value: String(subSummary.newThisMonth),
                        sub: `${subSummary.cancelledOrExpired} cancelled / expired`,
                      },
                      {
                        label: "Avg Seats / Plan",
                        value: String(subSummary.avgSeats),
                        sub: `${subSummary.activeWorkspaces} active workspaces`,
                      },
                    ].map((card) => (
                      <div key={card.label} className="rounded-xl border border-white/10 bg-zinc-900/50 p-4">
                        <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">{card.label}</p>
                        <p className="text-2xl font-black text-white mt-1">{card.value}</p>
                        <p className="text-[10px] text-zinc-500 font-semibold mt-1">{card.sub}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                      <thead>
                        <tr className="border-b border-white/10 bg-zinc-900/80">
                          {["Workspace", "Plan", "Status", "Seats", "Amount", "Cycle", "Starts", "Expires", "Txns"].map((col) => (
                            <th key={col} className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {subscriptions.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="px-4 py-12 text-center text-xs text-zinc-500 font-semibold">
                              No subscriptions found.
                            </td>
                          </tr>
                        ) : (
                          subscriptions.map((sub) => (
                            <tr key={sub.workspaceId} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="px-4 py-3 text-xs font-bold text-zinc-200">{sub.workspace}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-zinc-400">{sub.plan}</td>
                              <td className="px-4 py-3">
                                <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded border", subStatusColor(sub.status))}>
                                  {sub.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-zinc-400">{sub.seats}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-zinc-300">{sub.amountDisplay}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-zinc-400">{sub.cycle}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-zinc-500">{formatDate(sub.startsAt)}</td>
                              <td className="px-4 py-3 text-xs font-semibold text-zinc-500">
                                {sub.expiresAt ? formatDate(sub.expiresAt) : "—"}
                              </td>
                              <td className="px-4 py-3 text-xs font-semibold text-zinc-400">{sub.transactions}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-white/10 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/10 bg-zinc-900/80">
                        {["Payment ID", "Plan", "Amount", "Method", "Status", "Date"].map((col) => (
                          <th key={col} className="px-4 py-3 text-[9px] font-black uppercase tracking-wider text-zinc-500">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-xs text-zinc-500 font-semibold">
                            No transactions found.
                          </td>
                        </tr>
                      ) : (
                        transactions.map((txn) => (
                          <tr key={txn.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-xs font-mono font-bold text-violet-400">{txn.id}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-zinc-400">{txn.plan}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-zinc-300">{txn.amountDisplay}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-zinc-400 capitalize">{txn.method}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-emerald-400 capitalize">{txn.status}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-zinc-500">{formatWhen(txn.createdAt)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
