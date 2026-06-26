"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { DEFAULT_FORM_CATEGORIES } from "@/lib/form-categories";

export function useFormCategories() {
  const [categories, setCategories] = useState<string[]>([...DEFAULT_FORM_CATEGORIES]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient("/api/workspace/categories");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      }
    } catch (err) {
      console.error("Failed to load form categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, refetch: fetchCategories };
}
