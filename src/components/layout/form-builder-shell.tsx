"use client";

import { SearchModal } from "./search-modal";

/** Full-screen shell for the form canvas — no app sidebars or header. */
export function FormBuilderShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-background">
      {children}
      <SearchModal />
    </div>
  );
}
