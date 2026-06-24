import { useUIStore } from "@/stores/ui-store";

interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiClient(url: string, options: ApiClientOptions = {}): Promise<Response> {
  const { timeoutMs = 10000, ...fetchOptions } = options;

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  // Retrieve Supabase JWT session token if available on client
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      const { supabase } = await import("@/lib/supabase");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
      }
    } catch (e) {
      console.error("Failed to retrieve auth session token:", e);
    }
  }

  const mergedOptions = {
    ...fetchOptions,
    signal: controller.signal,
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` }),
      ...fetchOptions.headers,
    },
  };

  try {
    const response = await fetch(url, mergedOptions);
    clearTimeout(id);

    if (!response.ok) {
      const status = response.status;
      let message = "An error occurred while communicating with the server.";
      let code: "500" | "401" | "403" | "404" | "generic" = "generic";

      if (status === 500) {
        message = "Something went wrong on our side.";
        code = "500";
      } else if (status === 401) {
        message = "Session expired. Please login again.";
        code = "401";
      } else if (status === 403) {
        message = "You don't have permission.";
        code = "403";
      } else if (status === 404) {
        message = "Data not found.";
        code = "404";
      }

      // Dispatch alert to UI store
      useUIStore.getState().addGlobalAlert(code, message);

      // Re-throw custom error to let calling function know response failed
      throw new Error(message);
    }

    return response;
  } catch (err) {
    clearTimeout(id);
    const error = err as Error;

    // Check if error was caused by AbortController (timeout)
    if (error.name === "AbortError") {
      const timeoutMsg = "Server is taking too long to respond. Please try again.";
      useUIStore.getState().addGlobalAlert("timeout", timeoutMsg);
      throw new Error(timeoutMsg);
    }

    // Check if error was a general network failure (failed to fetch)
    if (error.message === "Failed to fetch" || error.name === "TypeError") {
      const netMsg = "Unable to connect. Check internet or try again.";
      useUIStore.getState().addGlobalAlert("network-failed", netMsg);
      throw new Error(netMsg);
    }

    throw error;
  }
}
