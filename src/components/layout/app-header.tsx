"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, LogOut, Settings, User, ChevronDown, Search, FileText, Globe, Layers, BarChart3, CreditCard } from "lucide-react";
import { useUIStore } from "@/stores/ui-store";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/tooltip";

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const user = useUIStore((state) => state.user);
  const setUser = useUIStore((state) => state.setUser);
  const setSearchOpen = useUIStore((state) => state.setSearchOpen);
  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      router.push("/login");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between select-none relative z-40">
      {/* Mock Search Trigger Input mimicking reference UI */}
      <div className="relative w-80 md:w-96 text-left">
        <button
          onClick={() => {
            setSearchOpen(true);
          }}
          className="w-full flex items-between justify-between pl-3.5 pr-3 py-2 rounded-xl bg-slate-100/50 dark:bg-slate-900/35 border border-border text-xs font-semibold hover:border-primary/50 text-slate-450 dark:text-slate-500 cursor-pointer select-none text-left"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Search pages, forms, settings...</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="px-1.5 py-0.5 rounded border border-border bg-card text-[9px] font-extrabold uppercase font-mono tracking-wider">Ctrl</span>
            <span className="px-1.5 py-0.5 rounded border border-border bg-card text-[9px] font-extrabold uppercase font-mono tracking-wider">K</span>
          </div>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Pro / Free Plan Badge */}
        {user && (
          <span
            onClick={() => router.push("/pricing")}
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all hover:scale-105 duration-200",
              user.pricingPlan === "Pro"
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-slate-500/10 text-slate-500 border-slate-500/20"
            )}
          >
            {user.pricingPlan} Plan
          </span>
        )}

        {/* Theme Toggle */}
        <Tooltip content="Toggle Theme">
          <button
            onClick={toggleTheme}
            className="h-9 w-9 rounded-xl border border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 flex items-center justify-center text-slate-500 dark:text-slate-400 cursor-pointer"
          >
            {theme === "dark" ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
          </button>
        </Tooltip>

        {/* User Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-border/60 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left cursor-pointer transition-all"
            >
              <div className="h-7 w-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-extrabold text-xs">
                {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
              </div>
              <div className="hidden md:block max-w-[100px]">
                <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate leading-tight">
                  {user.name}
                </div>
                <div className="text-[9px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                  {user.email}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border/80 bg-card p-1.5 shadow-lg z-40 animate-fadeInDown">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      router.push("/settings");
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850/80 text-left cursor-pointer"
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </button>
                  <div className="h-[1px] bg-border/60 my-1" />
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-955/20 text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Quick Logout Button */}
        {user && (
          <Tooltip content="Sign Out">
            <button
              onClick={handleSignOut}
              className="h-9 w-9 rounded-xl border border-border/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-500/20 flex items-center justify-center text-slate-500 hover:text-rose-500 dark:text-slate-400 cursor-pointer transition-all"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Tooltip>
        )}
      </div>
    </header>
  );
}
