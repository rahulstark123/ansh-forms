import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { ArrowRight, BarChart3, Check, CheckCircle2, ChevronDown, FileText, FolderOpen, Layers, Mail, Palette, QrCode, Sparkles, Wand2, X, Zap } from "lucide-react";
import {
  FREE_PLAN_EXCLUDED,
  FREE_PLAN_INCLUDED,
  PRO_PLAN_FEATURES,
  PRICING_COPY,
} from "@/lib/plan-features";
import "./landing.css";

/* ─── Features grid data ───────────────────────────────── */
const FEATURES = [
  {
    title: "Intuitive Visual Builder",
    desc: "Design polished multi-step forms using a drag-and-build canvas with live previews. Customize validation rules and responsive input styles easily.",
    icon: FileText,
  },
  {
    title: "AI-Powered Generation",
    desc: "Draft fully custom form schemas in seconds using natural language prompts. Fine-tune fields and settings instantly with complete editorial control.",
    icon: Sparkles,
  },
  {
    title: "Granular Brand Customization",
    desc: "Take command of header logos, footers, typography tone, and styling assets. Select premium backgrounds like aurora glow, grid dots, or silk gradients.",
    icon: Palette,
  },
  {
    title: "Real-Time Response Insights",
    desc: "Monitor views, conversion funnels, and completion metrics from interactive dashboard charts. Export structured submission data to CSV with ease.",
    icon: BarChart3,
  },
  {
    title: "Centralized Media Library",
    desc: "Manage brand logo assets, forms-specific media files, and attachment uploads submitted by your audience in a secure asset storage system.",
    icon: FolderOpen,
  },
  {
    title: "Instant Sharing & QR Codes",
    desc: "Share your forms with automatically generated unique short links, customizable embed codes, or high-resolution downloadable QR codes.",
    icon: QrCode,
  },
];

/* ─── Ecosystem apps data ───────────────────────────────── */
const APPS = [
  {
    id: "tasks",
    label: "ANSH Tasks",
    tagline: "Team task & project tracker",
    desc: "Assign, track and close tasks across teams",
    href: "https://tasks.anshapps.com",
    img: "/Ansh Task.jpg",
    status: "LIVE",
    statusColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    hoverBorder: "hover:border-cyan-500/50",
    hoverShadow: "hover:shadow-[0_4px_30px_rgba(6,182,212,0.18)]",
    dot: "bg-cyan-400",
    isHere: false,
    isSoon: false,
  },
  {
    id: "hr",
    label: "ANSH HR",
    tagline: "Human resource management",
    desc: "Employee records, leaves, payroll & more",
    href: "https://hr.anshapps.com",
    img: "/ANSH HR.jpg",
    status: "LIVE",
    statusColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    hoverBorder: "hover:border-purple-500/50",
    hoverShadow: "hover:shadow-[0_4px_30px_rgba(168,85,247,0.18)]",
    dot: "bg-purple-400",
    isHere: false,
    isSoon: false,
  },
  {
    id: "expense",
    label: "ANSH Expense",
    tagline: "Expense & spend operations",
    desc: "Submit, approve and audit business expenses",
    href: "https://expense.anshapps.com",
    img: "/ANSH Expense.jpg",
    status: "LIVE",
    statusColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    hoverBorder: "hover:border-amber-500/50",
    hoverShadow: "hover:shadow-[0_4px_30px_rgba(245,158,11,0.18)]",
    dot: "bg-amber-400",
    isHere: false,
    isSoon: false,
  },
  {
    id: "booking",
    label: "ANSH Booking",
    tagline: "Meeting room & resource booking",
    desc: "Reserve rooms, assets and slots with ease",
    href: null,
    img: null,
    status: "SOON",
    statusColor: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    hoverBorder: "hover:border-pink-500/50",
    hoverShadow: "hover:shadow-[0_4px_30px_rgba(236,72,153,0.18)]",
    dot: "bg-pink-400",
    isHere: false,
    isSoon: true,
  },
  {
    id: "visitor",
    label: "ANSH Visitor",
    tagline: "Smart lobby & guest management",
    desc: "QR passes, ID verification, check-in logs",
    href: "https://visitor.anshapps.com",
    img: "/ANSH Visitor.jpg",
    status: "LIVE",
    statusColor: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    hoverBorder: "hover:border-emerald-500/50",
    hoverShadow: "hover:shadow-[0_4px_30px_rgba(16,185,129,0.18)]",
    dot: "bg-emerald-400",
    isHere: false,
    isSoon: false,
  },
  {
    id: "forms",
    label: "ANSH Forms",
    tagline: "Modern forms & feedback ops",
    desc: "Build forms, publish landing pages & analyze",
    href: "#",
    img: null,
    status: "ACTIVE",
    statusColor: "text-white bg-gradient-to-r from-[#2563EB] to-[#9333EA] border-violet-500/30",
    hoverBorder: "",
    hoverShadow: "",
    dot: "bg-violet-400",
    isHere: true,
    isSoon: false,
  },
];

/* ─── Single card component (used in marquee rows) ─────── */
function AppCard({ app }: { app: typeof APPS[number] }) {
  const cardClass = `flex-shrink-0 w-[340px] rounded-2xl border border-white/10 bg-zinc-950/80 p-5 transition-all duration-300 mx-4 group/card ${app.hoverBorder} ${app.hoverShadow} hover:scale-[1.02] hover:bg-zinc-950`;

  const cardInner = (
    <>
      <div className="relative w-full h-[148px] rounded-xl overflow-hidden border border-white/5 bg-slate-950/60">
        {app.img && (
          <Image src={app.img} alt={app.label} fill className="object-cover group-hover/card:scale-105 transition-transform duration-500" />
        )}
        <div className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${app.statusColor}`}>
          {app.status}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3.5 mb-1">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${app.dot}`} />
          <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">{app.label}</span>
        </div>
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${app.statusColor}`}>{app.status}</span>
      </div>
      <p className="text-[11px] font-bold text-zinc-200 truncate">{app.tagline}</p>
      <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{app.desc}</p>
    </>
  );

  if (app.isHere) {
    return (
      <div className="relative flex-shrink-0 w-[340px] rounded-2xl border-2 border-violet-500 bg-[#09090b] p-5 shadow-[0_4px_30px_rgba(139,92,246,0.28)] mx-4">
        <div className="absolute -top-3.5 left-4 landing-btn-primary font-black px-3 py-0.5 rounded-full text-[7px] uppercase tracking-widest flex items-center gap-1 shadow-lg">
          <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
          YOU ARE HERE
        </div>
        <div className="w-full h-[148px] rounded-xl border border-violet-500/20 bg-zinc-950/60 p-3 flex flex-col justify-center gap-2.5">
          <div className="h-7 w-full rounded border border-white/10 bg-white/[0.03] px-2 flex items-center text-[7px] text-zinc-300 justify-between">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              <span>Customer Feedback Form</span>
            </div>
            <span className="text-[6px] text-violet-400 font-bold">Live</span>
          </div>
          <div className="h-7 w-full rounded border border-white/5 bg-white/[0.01] px-2 flex items-center text-[7px] text-zinc-500 justify-between">
            <span>Input: Professional Email</span>
            <span className="text-[5px] text-zinc-500 px-1 rounded border border-white/5">Email</span>
          </div>
          <div className="h-7 w-full rounded landing-btn-cta text-[8px] font-black uppercase tracking-wider flex items-center justify-center">
            Publish Forms
          </div>
        </div>
        <div className="flex items-center justify-between mt-3.5 mb-1">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400" />
            <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">ANSH Forms</span>
          </div>
          <span className="text-white landing-btn-primary px-1.5 py-0.5 rounded text-[8px] font-black uppercase">ACTIVE</span>
        </div>
        <p className="text-[11px] font-bold text-zinc-200 truncate">{app.tagline}</p>
        <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{app.desc}</p>
      </div>
    );
  }

  if (app.isSoon) {
    return (
      <div className={`flex-shrink-0 w-[340px] rounded-2xl border border-white/10 bg-zinc-950/80 p-5 transition-all duration-300 mx-4 ${app.hoverBorder} ${app.hoverShadow} hover:scale-[1.02]`}>
        <div className="relative w-full h-[148px] rounded-xl bg-gradient-to-br from-[#180f22] to-[#0d0714] border border-pink-500/10 flex flex-col items-center justify-center gap-2 overflow-hidden">
          <div className="absolute top-2 right-2 bg-pink-500/10 text-pink-400 border border-pink-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">BUILDING</div>
          <div className="h-10 w-10 rounded-full border border-dashed border-pink-500/40 flex items-center justify-center animate-[spin_12s_linear_infinite]">
            <div className="h-2 w-2 rounded-full bg-pink-500" />
          </div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-pink-400/70">In Development</span>
        </div>
        <div className="flex items-center justify-between mt-3.5 mb-1">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${app.dot}`} />
            <span className="text-xs font-black text-zinc-100 uppercase tracking-wider">{app.label}</span>
          </div>
          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${app.statusColor}`}>{app.status}</span>
        </div>
        <p className="text-[11px] font-bold text-zinc-200 truncate">{app.tagline}</p>
        <p className="text-[10px] text-zinc-400 mt-0.5 truncate">{app.desc}</p>
      </div>
    );
  }

  // Linked card (LIVE apps with external URLs)
  return (
    <a href={app.href!} target="_blank" rel="noopener noreferrer" className={cardClass}>
      {cardInner}
    </a>
  );
}

/* ─── Page ──────────────────────────────────────────────── */
export default async function RootPage() {
  const headersList = await headers();
  const countryHeader = headersList.get("x-vercel-ip-country") || headersList.get("cf-ipcountry") || "IN";
  const isIndia = countryHeader.toUpperCase() === "IN";
  const freePrice = isIndia ? "₹0" : "$0";
  const proPrice = isIndia ? "₹399" : "$5";

  return (
    <div className="landing-page bg-zinc-950 text-zinc-100 overflow-x-hidden">

      {/* Brand ambient glow blobs */}
      <div className="fixed top-0 left-0 w-[520px] h-[520px] landing-glow-cyan rounded-full pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="fixed top-0 right-0 w-[420px] h-[420px] landing-glow-violet rounded-full pointer-events-none translate-x-1/3 -translate-y-1/4" />
      <div className="fixed bottom-0 left-0 w-[520px] h-[520px] landing-glow-magenta rounded-full pointer-events-none -translate-x-1/4 translate-y-1/3" />
      <div className="fixed inset-0 pointer-events-none bg-zinc-950" />
      <div className="fixed inset-0 landing-grid-bg opacity-20 pointer-events-none" />

      {/* ── HERO SCREEN ─────────────────────────────────────────── */}
      <div className="relative z-10 min-h-screen flex flex-col">

        <header className="w-full px-6 md:px-12 py-5 flex items-center justify-between border-b border-white/10 backdrop-blur-sm bg-zinc-950/60 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <Image src="/logoAnshapps.png" alt="ANSH Apps Logo" width={40} height={40} className="h-10 w-10 object-contain" priority />
            <div>
              <p className="font-black tracking-tight text-lg leading-none">ANSH FORMS</p>
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">Modern Forms Platform</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-400">
            <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
            <a href="#why-ansh" className="hover:text-zinc-100 transition-colors">Why ANSH</a>
            <a href="#faq" className="hover:text-zinc-100 transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="px-4 py-2 rounded-xl border border-white/15 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">
              Login
            </Link>
          </div>
        </header>

        {/* HERO CONTENT — fills remaining viewport height */}
        <main className="flex-1 flex items-center">
          <section className="w-full max-w-7xl mx-auto px-6 md:px-12 py-10 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
            {/* Left: copy */}
            <div className="space-y-6">
              <span className="landing-badge inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
                <Wand2 className="h-3.5 w-3.5" />
                Built for High-Growth Teams &amp; Enterprises
              </span>
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-black tracking-tight leading-[1.05]">
                Run your complete
                <span className="block landing-brand-gradient">
                  Forms &amp; Response Ops
                </span>
                in one simple workspace
              </h1>
              <p className="text-sm text-zinc-300 max-w-xl font-semibold leading-relaxed">
                ANSH Forms combines visual form building, branding control, AI-assisted drafting, and analytics into one high-performance platform.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 max-w-xl">
                {[
                  "Enterprise-grade form workflows",
                  "Visual builder with section control",
                  "Brand-ready form experiences",
                  "Integrated analytics insights",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-2 text-[11px] font-semibold text-zinc-300">
                    <Check className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/signup" className="px-5 py-3 rounded-xl landing-btn-primary text-xs font-black uppercase tracking-wider hover:opacity-90 inline-flex items-center gap-2 transition-opacity">
                  Start 14-Day Free Trial <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link href="/login" className="px-5 py-3 rounded-xl border border-white/15 text-xs font-bold uppercase tracking-wider hover:bg-white/5 transition-colors">
                  Visit ANSH
                </Link>
              </div>
            </div>

            {/* Right: workspace dashboard preview */}
            <div className="relative group rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5 md:p-6 shadow-2xl shadow-cyan-950/25 overflow-hidden">
              <div className="absolute -right-16 -top-16 w-56 h-56 bg-[#00C6FF]/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-[#7000FF]/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative rounded-2xl border border-white/10 bg-zinc-950 overflow-hidden shadow-xl">
                {/* App chrome */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-violet-500/80" />
                  </div>
                  <div className="flex-1 max-w-[220px] px-3 py-1 rounded-md bg-white/[0.03] border border-white/5 text-[9px] text-zinc-400 font-mono truncate">
                    app.anshapps.com/forms
                  </div>
                  <span className="text-[8px] font-black uppercase text-violet-400 tracking-wider shrink-0">Workspace</span>
                </div>

                <div className="p-4 md:p-5 space-y-4">
                  {/* Stats strip */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: "Forms", value: "12", tone: "text-violet-400" },
                      { label: "Views", value: "4.2k", tone: "text-sky-400" },
                      { label: "Responses", value: "890", tone: "text-violet-400" },
                      { label: "Conv.", value: "24%", tone: "text-amber-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl border border-white/5 bg-white/[0.02] px-2 py-2 text-center">
                        <div className={`text-[11px] font-black font-mono leading-none ${stat.tone}`}>{stat.value}</div>
                        <div className="text-[7px] font-bold text-zinc-500 uppercase tracking-wider mt-1">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Form cards */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      {
                        title: "Customer Feedback",
                        slug: "feedback",
                        status: "Published",
                        statusClass: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                        views: 1284,
                        responses: 312,
                        conv: "24.3%",
                      },
                      {
                        title: "Event Registration",
                        slug: "event-reg",
                        status: "Draft",
                        statusClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                        views: 86,
                        responses: 0,
                        conv: "0%",
                      },
                    ].map((form) => (
                      <div
                        key={form.slug}
                        className="rounded-xl border border-white/8 bg-white/[0.02] p-3 space-y-2.5 group-hover:border-white/15 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-zinc-100 truncate">{form.title}</div>
                            <div className="text-[8px] text-zinc-500 font-mono truncate">/ansh-apps/{form.slug}</div>
                          </div>
                          <span className={`text-[6px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${form.statusClass}`}>
                            {form.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-center">
                          {[
                            { k: "Views", v: form.views },
                            { k: "Resp", v: form.responses },
                            { k: "Conv", v: form.conv },
                          ].map((m) => (
                            <div key={m.k} className="rounded-lg bg-black/20 py-1">
                              <div className="text-[9px] font-black text-zinc-200 font-mono leading-none">{m.v}</div>
                              <div className="text-[6px] text-zinc-500 font-bold uppercase mt-0.5">{m.k}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent responses */}
                  <div className="rounded-xl border border-white/8 bg-white/[0.015] overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
                      <span className="text-[8px] font-black uppercase tracking-wider text-zinc-400">Recent Responses</span>
                      <span className="text-[7px] font-bold text-violet-400">Live</span>
                    </div>
                    <div className="divide-y divide-white/5">
                      {[
                        { name: "Priya M.", form: "Feedback", time: "2m ago", status: "Submitted" },
                        { name: "Rahul K.", form: "Contact", time: "14m ago", status: "Approved" },
                        { name: "Sneha D.", form: "Feedback", time: "1h ago", status: "Under Review" },
                      ].map((row) => (
                        <div key={row.name + row.time} className="px-3 py-2 flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[9px] font-bold text-zinc-200 truncate">{row.name}</div>
                            <div className="text-[7px] text-zinc-500 truncate">{row.form} · {row.time}</div>
                          </div>
                          <span className="text-[6px] font-black uppercase text-zinc-400 border border-white/10 px-1.5 py-0.5 rounded shrink-0">
                            {row.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating: create form */}
              <div className="absolute left-3 top-16 sm:left-4 sm:top-[4.5rem] p-2 rounded-xl border border-violet-500/25 bg-[#09090b]/95 backdrop-blur-md shadow-lg shadow-violet-950/30 select-none pointer-events-none -translate-x-1 group-hover:translate-x-0 transition-transform duration-500">
                <div className="flex items-center gap-1.5">
                  <span className="h-5 w-5 rounded-lg landing-btn-primary flex items-center justify-center text-[10px] font-black">+</span>
                  <div>
                    <div className="text-[8px] font-black text-zinc-100 uppercase tracking-wider">New Form</div>
                    <div className="text-[7px] text-zinc-500 font-semibold">Blank or template</div>
                  </div>
                </div>
              </div>

              {/* Floating: analytics */}
              <div className="absolute right-3 bottom-20 sm:right-4 sm:bottom-24 p-2.5 rounded-xl border border-white/15 bg-zinc-950/95 backdrop-blur-md shadow-lg select-none pointer-events-none translate-y-1 group-hover:translate-y-0 transition-transform duration-500 w-[108px]">
                <div className="text-[7px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Traffic</div>
                <div className="flex items-end gap-0.5 h-8">
                  {[35, 52, 40, 68, 55, 82, 74].map((h, i) => (
                    <span
                      key={i}
                      className="flex-1 rounded-sm bg-gradient-to-t from-violet-500/30 to-[#4dc4ff]"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
                <div className="text-[8px] font-black text-violet-400 mt-1.5">+18% this week</div>
              </div>

              {/* Floating: share */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-3 sm:bottom-4 px-3 py-1.5 rounded-full border border-white/15 bg-zinc-950/90 backdrop-blur-md shadow-lg select-none pointer-events-none flex items-center gap-2">
                <QrCode className="h-3 w-3 text-[#4dc4ff]" />
                <span className="text-[8px] font-bold text-zinc-300">Share via link or QR</span>
              </div>
            </div>
          </section>
        </main>
      </div>

      {/* ── ECOSYSTEM MARQUEE SECTION ────────────────────────────── */}
      <section className="relative z-10 py-14 border-t border-white/5 overflow-hidden">
        {/* Header row */}
        <div className="w-full px-6 md:px-14 flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest block">ECOSYSTEM</span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              The full <span className="landing-brand-gradient">Ansh Apps</span> suite
            </h2>
          </div>
          <p className="text-xs text-zinc-400 font-semibold max-w-sm leading-relaxed md:text-right">
            One ecosystem, every business operation — manage tasks, HR, expenses, bookings and visitors from connected apps.
          </p>
        </div>

        {/* Marquee track — full bleed, no fade masks */}
        <div className="overflow-hidden w-full">
          <div className="flex animate-marquee hover:[animation-play-state:paused] w-max pb-6 pt-2">
            {/* Copy 1 */}
            {APPS.map((app) => (
              <AppCard key={`a-${app.id}`} app={app} />
            ))}
            {/* Copy 2 — identical, creates the seamless loop */}
            {APPS.map((app) => (
              <AppCard key={`b-${app.id}`} app={app} />
            ))}
          </div>
        </div>
      </section>

      {/* ── REST OF CONTENT ────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-20 space-y-20">
        {/* Features grid */}
        <section id="features" className="pt-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest block">Capabilities</span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              Power Your Entire Response Operations Natively
            </h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed">
              No need to pay for 4-5 different software tools. ANSH Forms consolidates visual form building, brand customizer, AI draft generator, and real-time response analytics under one unified workspace.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/10 bg-zinc-950/60 p-6 flex flex-col items-start gap-4 hover:border-violet-500/30 hover:bg-zinc-950/90 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_30px_rgba(139,92,246,0.06)] group">
                  <div className="h-10 w-10 rounded-xl landing-icon-circle flex items-center justify-center group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-zinc-100 tracking-wide">{item.title}</h3>
                    <p className="text-xs font-semibold text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4: Pricing */}
        <section id="pricing" className="pt-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="landing-badge px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block">
              Simple Pricing
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight pt-1">
              Affordable plans tailored for every scale
            </h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              {PRICING_COPY.sectionSubtitle}
            </p>
            <p className="text-xs font-bold text-violet-400/90 max-w-xl mx-auto">
              {PRICING_COPY.trialNote}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto pt-4">
            
            {/* Free Plan */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950/40 p-8 flex flex-col justify-between hover:border-white/20 transition-all duration-300 relative group">
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-wider text-zinc-400">
                    For Micro Teams
                  </span>
                  <div className="flex items-baseline gap-1 text-right">
                    <span className="text-4xl font-black text-white">{freePrice}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">/ workspace</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Free Plan</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed font-semibold mt-1">
                    {PRICING_COPY.freeDescription}
                  </p>
                </div>

                <div className="h-[1px] bg-white/5" />

                <ul className="space-y-3 text-xs font-bold">
                  {FREE_PLAN_INCLUDED.map((feature) => (
                    <li key={feature} className="flex gap-2.5 items-start text-zinc-300">
                      <Check className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {FREE_PLAN_EXCLUDED.map((feature) => (
                    <li key={feature} className="flex gap-2.5 items-start text-zinc-500">
                      <X className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                      <span className="line-through decoration-zinc-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 space-y-4">
                <p className="text-[10px] text-zinc-500 font-bold select-none text-center">
                  No credit card needed to start
                </p>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="rounded-2xl border-2 border-violet-500 bg-zinc-950/80 p-8 flex flex-col justify-between shadow-[0_4px_30px_rgba(139,92,246,0.18)] hover:scale-[1.01] transition-transform duration-300 relative group">
              <span className="absolute -top-3 left-6 landing-btn-primary font-black px-3 py-0.5 rounded-full text-[8px] uppercase tracking-widest flex items-center gap-1 shadow-lg">
                <span className="h-1 w-1 rounded-full bg-white animate-pulse" />
                RECOMMENDED
              </span>

              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <span className="px-2 py-0.5 rounded bg-violet-500/10 border border-violet-500/20 text-[8px] font-black uppercase tracking-wider text-violet-400">
                    Best Value
                  </span>
                  <div className="flex items-baseline gap-1 text-right">
                    <span className="text-4xl font-black text-white">{proPrice}</span>
                    <span className="text-[10px] text-zinc-400 font-bold">/ month</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-white">Pro Plan</h3>
                  <p className="text-xs text-zinc-300 leading-relaxed font-semibold mt-1">
                    {PRICING_COPY.proDescription}
                  </p>
                </div>

                <div className="h-[1px] bg-white/5" />

                <ul className="space-y-3 text-xs font-bold text-zinc-200">
                  {PRO_PLAN_FEATURES.map((feature) => (
                    <li key={feature} className="flex gap-2.5 items-start">
                      <Check className="h-4 w-4 text-violet-400 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8 space-y-4">
                <p className="text-[10px] text-zinc-400 font-bold select-none text-center">
                  Billed monthly · Secure checkout via Razorpay
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Section: Why Teams Switch */}
        <section id="why-switch" className="pt-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="landing-badge px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block">
              Why Teams Switch
            </span>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight pt-1">
              Why teams choose ANSH Forms over Typeform, Google Forms, and Jotform
            </h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              We are built for organizations that want real data collection power, professional custom branding, and zero setup friction in one integrated workspace.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Compared to Typeform */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6 flex flex-col items-start gap-4 hover:border-violet-500/40 hover:bg-zinc-950/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_30px_rgba(139,92,246,0.06)] group">
              <div className="h-10 w-10 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors duration-300">
                <Palette className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-black text-zinc-100 tracking-wide">Compared to Typeform</h3>
                <p className="text-xs font-bold text-zinc-300 leading-relaxed">
                  Design brand-ready layouts without high premium paywalls.
                </p>
                <ul className="space-y-2.5 pt-2">
                  <li className="flex gap-2 items-start text-[11px] font-semibold text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>Typeform restricts basic features, custom colors, and response volumes behind expensive pricing tiers.</span>
                  </li>
                  <li className="flex gap-2 items-start text-[11px] font-semibold text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>ANSH Forms combines a visual builder, premium brand themes, and analytics under one simple pricing structure.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 2: Compared to Google Forms */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6 flex flex-col items-start gap-4 hover:border-violet-500/40 hover:bg-zinc-950/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_30px_rgba(139,92,246,0.06)] group">
              <div className="h-10 w-10 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors duration-300">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-black text-zinc-100 tracking-wide">Compared to Google Forms</h3>
                <p className="text-xs font-bold text-zinc-300 leading-relaxed">
                  Build custom branded forms, not rigid generic lists.
                </p>
                <ul className="space-y-2.5 pt-2">
                  <li className="flex gap-2 items-start text-[11px] font-semibold text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>Google Forms is free but offers highly basic generic layouts that fail to represent your premium corporate identity.</span>
                  </li>
                  <li className="flex gap-2 items-start text-[11px] font-semibold text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>ANSH Forms provides logo styling, customizable headers, and premium background themes to match your corporate styling.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Card 3: Compared to Jotform */}
            <div className="rounded-2xl border border-white/10 bg-zinc-950/50 p-6 flex flex-col items-start gap-4 hover:border-violet-500/40 hover:bg-zinc-950/80 transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_4px_30px_rgba(139,92,246,0.06)] group">
              <div className="h-10 w-10 rounded-xl border border-violet-500/20 bg-violet-500/10 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-colors duration-300">
                <Zap className="h-5 w-5" />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-black text-zinc-100 tracking-wide">Compared to Jotform</h3>
                <p className="text-xs font-bold text-zinc-300 leading-relaxed">
                  Enjoy high-speed dashboards without lag or response limits.
                </p>
                <ul className="space-y-2.5 pt-2">
                  <li className="flex gap-2 items-start text-[11px] font-semibold text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>Jotform is highly complex but gets expensive quickly, limits file uploads, and suffers from heavy layout loading times.</span>
                  </li>
                  <li className="flex gap-2 items-start text-[11px] font-semibold text-zinc-400">
                    <Check className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                    <span>ANSH Forms integrates high-speed visual building, response analytics, and secure files storage in one unified workspace.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Model comparisons at the bottom */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.02] p-6 space-y-3">
              <span className="text-[10px] font-black uppercase text-violet-400 tracking-widest block">THE ANSH FORMS MODEL</span>
              <p className="text-xs font-semibold text-zinc-300 leading-relaxed">
                A unified, high-performance workspace that any team member can adopt in minutes. Form building, customizable branding, AI templates drafting, and response analytics live together with zero hidden setups or seat license inflation.
              </p>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-6 space-y-3">
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block">THE BLOATED LEGACY TOOL MODEL</span>
              <p className="text-xs font-semibold text-zinc-400 leading-relaxed">
                Steep learning curves, complicated configurations, generic layouts, expensive per-user seating licenses, separate add-on bills for file attachments/storage space, and restrictive response limits.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: FAQ Accordion */}
        <section id="faq" className="pt-8">
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-2xl mx-auto">
              Got questions about ANSH Forms? Find quick answers below.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              [
                "How does ANSH Forms benefit teams compared to other form builder apps?",
                "ANSH Forms consolidates visual form building, brand styling customization, and real-time response analytics under one unified workspace. This eliminates the need to pay for multiple separate tool subscriptions."
              ],
              [
                "Can I customize the branding and theme background styles?",
                "Yes. You can take complete control of logos, header colors, footer text, typography tone, and choose from a library of premium background designs (such as Aurora Glow, Dot Grid, and Silk Gradients) to match your corporate identity."
              ],
              [
                "How do file uploads work for form respondents?",
                "Respondents can securely upload files (like PDFs, images, and documents) directly within your forms. These files are securely hosted and managed within your ANSH Forms file manager panel."
              ],
              [
                "How is the collected response data secured and exported?",
                "All response submissions are stored securely and encrypted in transit. You can monitor submission rates, views, and conversion funnel analytics in real-time, and export all responses to standard CSV format at any time."
              ]
            ].map(([q, a], i) => (
              <details key={i} className="group border border-white/10 bg-zinc-950/60 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between p-5 cursor-pointer select-none text-zinc-205 hover:text-white transition-colors duration-200">
                  <span className="text-sm font-bold tracking-wide pr-4">{q}</span>
                  <ChevronDown className="h-4 w-4 text-zinc-400 group-open:rotate-180 transition-transform duration-300 shrink-0" />
                </summary>
                <div className="px-5 pb-5 pt-1 text-xs font-semibold text-zinc-400 leading-relaxed border-t border-white/5 bg-white/[0.01]">
                  {a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section id="why-ansh" className="relative landing-cta-section rounded-3xl border border-white/10 p-10 md:p-16 text-center overflow-hidden">
          {/* Ambient brand glow behind the text */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-[#7000FF]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-56 h-56 bg-[#00C6FF]/10 rounded-full blur-[70px] pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center gap-6">
            {/* Icon block */}
            <div className="h-12 w-12 rounded-xl landing-icon-circle flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight max-w-lg">
              Ready to accelerate your team&apos;s workflow?
            </h2>

            <p className="text-sm font-semibold text-zinc-400 leading-relaxed max-w-md">
              Create your free workspace in under two minutes. No credit card required. Enjoy complete access to forms, templates, and brand customizer.
            </p>

            <Link
              href="/signup"
              className="px-6 py-3.5 rounded-xl landing-btn-cta text-xs font-black uppercase tracking-wider hover:opacity-90 inline-flex items-center gap-2 transition-all duration-200 active:scale-[0.98] mt-2"
            >
              Start 14-Day Free Trial <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/10 bg-zinc-950 pt-16 pb-8">
        <div className="max-w-[1536px] mx-auto px-6 md:px-14 lg:px-20 flex flex-col items-center gap-12">
          
          {/* Handled by & Big title */}
          <div className="text-center space-y-4 select-none">
            <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <span>Handled by</span>
              <Image src="/logoAnshapps.png" alt="ANSH Logo" width={16} height={16} className="h-4 w-4 object-contain opacity-70" />
            </div>
            <h1 className="text-7xl sm:text-8xl md:text-[10rem] lg:text-[12rem] xl:text-[13.5rem] font-black tracking-tighter landing-brand-gradient leading-none">
              Ansh Apps
            </h1>
          </div>

          {/* Links Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pt-6">
            
            {/* Info Col */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image src="/logoAnshapps.png" alt="ANSH Logo" width={24} height={24} className="h-6 w-6 object-contain" />
                <span className="font-black text-sm uppercase tracking-wider text-white">ANSH Forms</span>
              </div>
              <p className="text-xs font-semibold text-zinc-400 leading-relaxed max-w-xs">
                The ultimate form builder canvas designed for teams who construct templates, customize brand layouts, and analyze response submissions daily.
              </p>
            </div>

            {/* Product Col */}
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-4">Product</span>
              <ul className="space-y-2.5 text-xs font-semibold text-zinc-400">
                <li><a href="#features" className="hover:text-white transition-colors duration-200">Visual Builder</a></li>
                <li><a href="#features" className="hover:text-white transition-colors duration-200">AI Draft Generator</a></li>
                <li><a href="#features" className="hover:text-white transition-colors duration-200">Brand Customizer</a></li>
                <li><a href="#features" className="hover:text-white transition-colors duration-200">Response Analytics</a></li>
                <li><a href="#features" className="hover:text-white transition-colors duration-200">Media Library</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors duration-200">Pricing Plans</a></li>
              </ul>
            </div>

            {/* Account Col */}
            <div>
              <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-4">Account</span>
              <ul className="space-y-2.5 text-xs font-semibold text-zinc-400">
                <li><Link href="/login" className="hover:text-white transition-colors duration-200">Sign In</Link></li>
                <li><Link href="/signup" className="hover:text-white transition-colors duration-200">Sign Up</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors duration-200">Dashboard</Link></li>
                <li><Link href="/settings" className="hover:text-white transition-colors duration-200">Settings</Link></li>
              </ul>
            </div>

            {/* Touch Col */}
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest block mb-4">Get in Touch</span>
                <p className="text-xs font-semibold text-zinc-400 leading-relaxed max-w-xs">
                  Have questions or need custom business plans? Talk to our creators.
                </p>
              </div>
              <a href="mailto:hello@anshapps.com" className="flex items-center gap-2 text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors duration-200">
                <Mail className="h-4 w-4" />
                <span>hello@anshapps.com</span>
              </a>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="w-full border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <span className="text-[10px] font-semibold text-zinc-500 select-none">
              &copy; 2026 ANSH Forms. All rights reserved.
            </span>
            <div className="flex gap-6 text-[10px] font-bold text-zinc-500">
              <Link href="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link>
              <a href="mailto:hello@anshapps.com" className="hover:text-zinc-300 transition-colors">Contact Us</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
