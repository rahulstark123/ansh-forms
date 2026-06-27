"use client";

import Image from "next/image";
import { Monitor, Smartphone } from "lucide-react";

export function MobileBuildingScreen() {
  return (
    <div className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 px-6 text-center select-none">
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#00C6FF]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#7000FF]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-sm space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <Image
            src="/logoAnshapps.png"
            alt="Ansh Apps"
            width={44}
            height={44}
            className="h-11 w-11 object-contain"
            priority
          />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-violet-400">
            <Smartphone className="h-3.5 w-3.5" />
            Mobile App
          </div>
          <h1 className="text-xl font-black tracking-tight text-white">
            Mobile experience is in building phase
          </h1>
          <p className="text-sm font-semibold text-zinc-400 leading-relaxed">
            ANSH Forms workspace is optimized for desktop web right now. Please open this app on a larger screen or use your browser&apos;s desktop view.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-xs font-bold text-zinc-300">
          <Monitor className="h-4 w-4 text-violet-400 shrink-0" />
          <span>Best viewed at 1000px width or wider</span>
        </div>
      </div>
    </div>
  );
}
