"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import LineStatusGrid from "@/components/dashboard/LineStatusGrid";
import { fetchApi, invalidateApiCache } from "@/lib/api";

export default function FinishingMillStatus({ compact = false, lineName = "" }: { compact?: boolean; lineName?: string }) {
  const [lines, setLines] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");
  const [receivedAt, setReceivedAt] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const current = ++requestId.current;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 25_000);
    setLoading(true); setSlow(false); setError("");
    try {
      const data = await fetchApi("/dashboard/", { signal: controller.signal });
      if (!Array.isArray(data)) throw new Error("The line records could not be read.");
      if (current !== requestId.current) return;
      setLines(data);
      setReceivedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      if (current !== requestId.current) return;
      setError(controller.signal.aborted ? "The server is taking too long. Retry to load the installation records." : e instanceof Error ? e.message : "Could not load finishing-mill records.");
    } finally {
      window.clearTimeout(timeout);
      if (current === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (!loading) return;
    const hint = window.setTimeout(() => setSlow(true), 4_000);
    return () => window.clearTimeout(hint);
  }, [loading]);

  const visibleLines = lines?.filter(line => !lineName || line.name === lineName);
  const installed = visibleLines?.reduce((count, line) => count + (line.positions || []).filter((p: any) => p.current_stand).length, 0);
  const refresh = () => { invalidateApiCache(); void load(); };

  return <section aria-labelledby={compact ? "plant-fmir-title" : "fmir-line-title"} aria-busy={loading} className="space-y-3">
    <div className="dsr-section-head">
      <div>
        <div className="dsr-kicker">FMIR · Finishing Mill · Digital Stand Register</div>
        <h2 id={compact ? "plant-fmir-title" : "fmir-line-title"} className="dsr-title">{lineName ? lineName + " stand status" : "WRM 1–3 stand status"}</h2>
        <p className="dsr-subtitle">Installed stands by line and position, from the stand-change register.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {compact && <Link href="/fmir" className="dsr-btn">Open FMIR</Link>}
        <button className="dsr-btn" disabled={loading} onClick={refresh}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{loading ? "Loading…" : "Refresh"}</button>
      </div>
    </div>
    {error && <div role="alert" className="rounded-lg border border-red-900 bg-red-950/25 p-3 text-sm text-red-200">
      {error} {lines !== null && "Previously loaded records remain below."}<button className="dsr-btn ml-3" onClick={refresh}>Retry</button>
    </div>}
    {loading && lines === null && <div role="status" className="space-y-3">
      {[1, 2, 3].map(line => <div key={line} className="mechanical-panel bg-[#111827] p-4">
        <div className="mb-3 h-5 w-36 rounded bg-[#1f293d] animate-pulse motion-reduce:animate-none" />
        <div className="grid grid-cols-5 gap-2 md:grid-cols-10">{Array.from({ length: 10 }, (_, i) => <div key={i} className="h-20 rounded bg-[#1f293d] animate-pulse motion-reduce:animate-none" />)}</div>
      </div>)}
      <p className="text-sm text-slate-400">{slow ? "The free server may be waking up. Your records will appear when it responds." : "Loading finishing-mill installation records…"}</p>
    </div>}
    {lines !== null && <>
      <div className="flex flex-wrap gap-3 text-xs text-slate-400"><span>{installed} installed stands</span><span>{visibleLines?.length || 0} recorded lines</span>{receivedAt && <span>Records received at {receivedAt}{error ? " · refresh failed" : loading ? " · refreshing" : ""}</span>}</div>
      {visibleLines?.length ? <LineStatusGrid lines={visibleLines} /> : <div className="mechanical-panel p-5 text-sm text-slate-400">No line installation records are available. Record the actual lineup through Stand Change.</div>}
    </>}
    <p className="text-xs text-slate-500">Installation records establish the lineup. They do not confirm the line is operating. Calendar age is elapsed time since installation, not measured operating hours.</p>
  </section>;
}
