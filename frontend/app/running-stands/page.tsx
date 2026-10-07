"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { fetchApi } from "@/lib/api";

type Config={module:string;area:string;lines:Record<string,string[]>;total_running:number;updated_at?:string};

function daysLabel(){return "Running configuration";}

export default function RunningStandsPage(){
 const [config,setConfig]=useState<Config|null>(null);
 const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 const load=async()=>{setLoading(true);try{setError("");setConfig(await fetchApi("/assets/running-config/DSIR"));}catch(e){setError(e instanceof Error?e.message:"Could not load DSIR running configuration")}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 return <div className="dsr-page"><Header title="Running Stand"/><main className="dsr-main"><div className="full-bleed space-y-4">
  <div className="dsr-section-head"><div><div className="dsr-kicker">Live operations · DSIR</div><h1 className="dsr-title">Running Stands</h1><p className="dsr-subtitle">Current WRM1 / WRM2 / WRM3 running stand configuration.</p></div><button onClick={load} className="dsr-btn">Refresh</button></div>
  {error&&<div className="rounded-lg border border-red-900 bg-red-950/25 p-3 text-sm text-red-300">{error}</div>}
  <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
   <div className="dsr-stat"><div className="dsr-stat-label">Running now</div><div className="dsr-stat-value text-emerald-300">{config?.total_running??0}</div></div>
   <div className="dsr-stat"><div className="dsr-stat-label">Running lines</div><div className="dsr-stat-value">3</div></div>
   <div className="dsr-stat"><div className="dsr-stat-label">Stands / line</div><div className="dsr-stat-value">10</div></div>
   <div className="dsr-stat"><div className="dsr-stat-label">Status</div><div className="dsr-stat-value text-base text-emerald-300">LIVE CONFIG</div></div>
  </section>
  <section className="mechanical-panel overflow-hidden">
   <div className="dsr-panel-head"><div><div className="dsr-kicker">Finishing Mill</div><div className="font-bold text-white">Status of Running Stands</div></div><span className="dsr-chip text-emerald-300">{config?.total_running??0} running</span></div>
   {loading?<div className="dsr-empty">Loading running configuration...</div>:<div className="p-3 space-y-3">
    {Object.entries(config?.lines||{}).map(([line,stands])=><div key={line} className="rounded-xl border border-[#253247] bg-[#0b111d] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#253247] flex items-center justify-between"><div className="font-bold text-white">{line}</div><div className="text-xs font-bold text-emerald-300">{stands.length}/10 RUNNING</div></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 p-3">{stands.map((code,i)=><div key={i} className="rounded-lg border border-emerald-900/60 bg-emerald-950/20 p-3 text-center"><div className="text-[10px] text-slate-500">Stand {i+1}</div><div className="mt-1 text-lg font-black text-white">{code}</div><div className="mt-1 text-[9px] font-bold text-emerald-300">RUNNING</div></div>)}</div>
    </div>)}
   </div>}
  </section>
  <div className="text-xs text-slate-500">{daysLabel()} · Source: configured current plant running lineup · Last configured: 08 Oct 2026.</div>
 </div></main></div>
}