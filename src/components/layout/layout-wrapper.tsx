"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./app-shell";
import { FormBuilderShell } from "./form-builder-shell";
import { useUIStore } from "@/stores/ui-store";
import { useEffect } from "react";
import { isMobileBlockExemptRoute } from "@/lib/responsive-breakpoints";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const user = useUIStore((state) => state.user);

  // Load saved theme on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      }
    }
  }, [setTheme]);

  // Apply active theme class and accent on load/change
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    if (user?.accent) {
      root.setAttribute("data-accent", user.accent);
    } else {
      root.removeAttribute("data-accent");
    }
  }, [theme, user?.accent]);

  // Public and Auth routes that don't need the dashboard sidebar shell
  const isFormBuilderRoute = /^\/forms\/[^/]+\/edit$/.test(pathname ?? "");
  const isPlainLayout = isMobileBlockExemptRoute(pathname);

  if (isFormBuilderRoute) {
    return <FormBuilderShell>{children}</FormBuilderShell>;
  }

  if (isPlainLayout) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
