"use client";

import { useEffect } from "react";
import { useUIStore } from "@/stores/ui-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  MOBILE_BLOCKED_MAX_WIDTH,
  SIDEBAR_AUTO_COLLAPSE_MAX_WIDTH,
  isMobileBlockExemptRoute,
} from "@/lib/responsive-breakpoints";

/** Auto-collapse sidebar on smaller desktop/tablet widths */
export function useResponsiveSidebar() {
  const setSidebarCollapsed = useUIStore((state) => state.setSidebarCollapsed);

  useEffect(() => {
    const update = () => {
      if (window.innerWidth <= SIDEBAR_AUTO_COLLAPSE_MAX_WIDTH) {
        setSidebarCollapsed(true);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [setSidebarCollapsed]);
}

export function useShouldForceSidebarCollapsed(): boolean {
  const matches = useMediaQuery(
    `(max-width: ${SIDEBAR_AUTO_COLLAPSE_MAX_WIDTH}px)`
  );
  return matches === true;
}

export function useIsMobileBlocked(pathname?: string | null): boolean | null {
  const matches = useMediaQuery(`(max-width: ${MOBILE_BLOCKED_MAX_WIDTH}px)`);

  if (isMobileBlockExemptRoute(pathname)) {
    return false;
  }

  return matches;
}
