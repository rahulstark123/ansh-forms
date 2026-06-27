"use client";

import { usePathname } from "next/navigation";
import { SearchModal } from "./search-modal";
import { MobileBuildingScreen } from "./mobile-building-screen";
import { useIsMobileBlocked } from "@/hooks/use-responsive-shell";

/** Full-screen shell for the form canvas — no app sidebars or header. */
export function FormBuilderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isMobileBlocked = useIsMobileBlocked(pathname);

  if (isMobileBlocked === true) {
    return <MobileBuildingScreen />;
  }

  if (isMobileBlocked === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {children}
      <SearchModal />
    </div>
  );
}
