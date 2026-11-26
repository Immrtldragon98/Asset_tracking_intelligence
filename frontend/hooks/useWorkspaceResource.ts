"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchApi, invalidateApiCache } from "@/lib/api";

export function useWorkspaceResource<T>(endpoint: string | null) {
  const [data, setData] = useState<T | null>(null), [error, setError] = useState(""), [loading, setLoading] = useState(!!endpoint);
  const version = useRef(0);
  const load = useCallback(async (force = false) => {
    const request = ++version.current;
    if (!endpoint) { setData(null); setLoading(false); setError(""); return; }
    if (force) invalidateApiCache();
    setLoading(true); setError("");
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 55_000);
    try {
      const value = await fetchApi(endpoint, { signal: controller.signal }) as T;
      if (version.current === request) setData(value);
    } catch (e) {
      if (version.current === request) setError(controller.signal.aborted ? "The server is taking too long. Retry when it has started." : e instanceof Error ? e.message : "Could not load records.");
    } finally { window.clearTimeout(timer); if (version.current === request) setLoading(false); }
  }, [endpoint]);
  useEffect(() => { setData(null); void load(); return () => { version.current++; }; }, [load]);
  return { data, error, loading, reload: () => load(true) };
}
