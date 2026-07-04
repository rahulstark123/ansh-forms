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

  // The public landing page ("/") owns its own light/dark theme (default light)
  // scoped to its `.landing-page` wrapper, so the app-wide dark default must not
  // bleed onto it via <html>.
  const isLandingRoute = pathname === "/";

  // Load saved theme on mount (skip on the landing route)
  useEffect(() => {
    if (isLandingRoute) return;
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark";
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark")) {
        setTheme(savedTheme);
      }
    }
  }, [setTheme, isLandingRoute]);

  // Apply active theme class and accent on load/change
  useEffect(() => {
    const root = window.document.documentElement;
    if (isLandingRoute) {
      // Keep the document light; the landing page toggles dark on its own wrapper.
      root.classList.remove("dark");
      root.classList.add("light");
      return;
    }
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    if (user?.accent) {
      root.setAttribute("data-accent", user.accent);
    } else {
      root.removeAttribute("data-accent");
    }
  }, [theme, user?.accent, isLandingRoute]);

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
