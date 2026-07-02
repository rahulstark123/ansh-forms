import { BadgeCheck, Building2, ShieldCheck } from "lucide-react";

export const UDYAM_REGISTRATION_NUMBER = "UDYAM-BR-23-0127857";

export interface TrustComplianceProps {
  showDescription?: boolean;
  compact?: boolean;
}

export function TrustCompliance({
  showDescription = true,
  compact = false,
}: TrustComplianceProps) {
  return (
    <section
      id="trust-compliance"
      className={
        compact
          ? "py-12 relative"
          : "relative border-t border-white/5 bg-zinc-950/80 py-20 md:py-24"
      }
      aria-labelledby="trust-compliance-heading"
    >
      {!compact && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.06),transparent_50%)]" />
      )}
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
        <div
          className={
            compact
              ? "rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8"
              : "rounded-[28px] border border-white/10 bg-zinc-950/60 p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-sm md:p-12"
          }
        >
          <div
            className={
              compact
                ? "flex flex-col gap-6"
                : "grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14"
            }
          >
            <div className={compact ? "space-y-4" : "space-y-5"}>
              <div className="landing-badge inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>Trust &amp; Compliance</span>
              </div>

              <h2
                id="trust-compliance-heading"
                className={
                  compact
                    ? "text-2xl font-black leading-tight tracking-tight text-zinc-100"
                    : "text-3xl font-black leading-tight tracking-tight text-zinc-100 md:text-4xl"
                }
              >
                Built from Bharat, Ready for the World
              </h2>

              {showDescription && (
                <p
                  className={
                    compact
                      ? "max-w-xl text-sm font-semibold leading-relaxed text-zinc-400"
                      : "max-w-xl text-sm font-semibold leading-relaxed text-zinc-400 md:text-base"
                  }
                >
                  ANSH Apps is a Government of India MSME-registered software company
                  building simple, affordable, and modern business software for teams,
                  startups, and growing businesses.
                </p>
              )}
            </div>

            <div className={compact ? "flex flex-col gap-4" : "flex flex-col gap-5"}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/15 md:p-6">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10">
                    <Building2
                      className="h-5 w-5 text-emerald-400"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold leading-snug text-zinc-100">
                      MSME Registered Enterprise
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-relaxed text-zinc-500">
                      Government of India Udyam Registered
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/15 md:p-6">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                    <BadgeCheck
                      className="h-5 w-5 text-violet-400"
                      aria-hidden
                    />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-[11px] font-black uppercase tracking-wider text-zinc-500">
                      Udyam Registration Number
                    </p>
                    <p className="mt-1.5 break-all font-mono text-sm font-semibold tracking-wide text-zinc-100 md:text-base">
                      {UDYAM_REGISTRATION_NUMBER}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
