"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({ content, children, position = "top", className }: TooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2 origin-bottom",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2 origin-top",
    left: "right-full top-1/2 -translate-y-1/2 mr-2 origin-right",
    right: "left-full top-1/2 -translate-y-1/2 ml-2 origin-left",
  };

  return (
    <div className="relative group/tooltip inline-flex items-center justify-center">
      {children}
      <div
        className={cn(
          "absolute z-[100] scale-95 opacity-0 pointer-events-none group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 transition-all duration-100 ease-out",
          "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-zinc-100 bg-[#090b14]/95 border border-white/[0.08] backdrop-blur-md rounded-lg shadow-xl whitespace-nowrap",
          positionClasses[position],
          className
        )}
      >
        {content}
      </div>
    </div>
  );
}
