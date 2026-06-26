"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

let cachedSlug: string | null = null;
let inflight: Promise<string> | null = null;

export function useWorkspaceSlug(): string {
  const [slug, setSlug] = useState(cachedSlug || "");

  useEffect(() => {
    if (cachedSlug) {
      setSlug(cachedSlug);
      return;
    }

    if (!inflight) {
      inflight = apiClient("/api/workspace")
        .then((r) => r.json())
        .then((data) => {
          const next = data.workspace?.slug || "";
          if (next) cachedSlug = next;
          return next;
        })
        .catch(() => "")
        .finally(() => {
          inflight = null;
        });
    }

    inflight.then((next) => {
      if (next) setSlug(next);
    });
  }, []);

  return slug;
}

export function clearWorkspaceSlugCache() {
  cachedSlug = null;
}
