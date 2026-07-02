import Link from "next/link";
import { Building2 } from "lucide-react";

export const DEFAULT_TRUST_COMPLIANCE_HREF = "https://anshapps.com/#trust-compliance";

export interface MsmeBadgeProps {
  href?: string;
  className?: string;
  variant?: "dark" | "light";
}

export function MsmeBadge({
  href = DEFAULT_TRUST_COMPLIANCE_HREF,
  className = "",
  variant = "dark",
}: MsmeBadgeProps) {
  const isExternal =
    href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");

  const content = (
    <>
      <Building2
        className={`h-3.5 w-3.5 shrink-0 ${
          variant === "dark" ? "text-emerald-400/90" : "text-emerald-600"
        }`}
        aria-hidden
      />
      <span className="flex flex-col items-start text-left leading-tight">
        <span
          className={`text-[11px] font-semibold ${
            variant === "dark" ? "text-zinc-300" : "text-zinc-700"
          }`}
        >
          MSME Registered Enterprise
        </span>
        <span
          className={`text-[10px] ${
            variant === "dark" ? "text-zinc-500" : "text-zinc-500"
          }`}
        >
          Government of India Udyam Registered
        </span>
      </span>
    </>
  );

  const baseClassName = `group inline-flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 ${
    variant === "dark"
      ? "border-white/8 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
      : "border-zinc-200/80 bg-zinc-50/80 hover:border-zinc-300 hover:bg-zinc-100"
  } ${className}`;

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClassName}
        aria-label="MSME Registered Enterprise — view trust and compliance details on ANSH Apps"
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={baseClassName}
      aria-label="MSME Registered Enterprise — view trust and compliance details"
    >
      {content}
    </Link>
  );
}
