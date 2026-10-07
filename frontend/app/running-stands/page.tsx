"use client";

import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { fetchApi } from "@/lib/api";

type Stand={id:number;code:string;current_status:string;lifetime_hours:number;current_installed_at:string|null;current_campaign_hours?:number;is_running:boolean};

function fmtDate(v:string|null){if(!v)return "Not installed";const d=new Date(v);return Number.isNaN(d.getTime())?"Not installed":d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
function runningDays(v:string|null){if(!v)return 0;const t=new Date(v).getTime();return Number.isNaN(t)?0:Math.max(0,Math.floor((Date.now()-t)/86400000))}
export default function RunningStandsPage(){
 const [stands,setStands]=useState<Stand[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
 const load=async()=>{setLoading(true);try{setStands(await fetchApi("/stands/"))}catch(e){setError(e instanceof Error?e.message:"Could not load running stands")}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const running=stands.filter(s=>s.is_running||!!s.current_installed_at);
 return <div className="dsr-page"><Header title="Running Stand"/><main className="dsr-main"><div className="full-bleed space-y-4">
  <div className="dsr-section-head"><div><div className="dsr-kicker">Live operations</div><h1 className="dsr-title">Running Stands</h1><p className="dsr-subtitle">Current installed stand, installation date and running duration.</p></div><button onClick={load} className="dsr-btn">Refresh</button></div>
  {error&&<div className="rounded-lg border border-red-900 bg-red-950/25 p-3 text-sm text-red-300">{error}</div>}
  <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
   <div className="dsr-stat"><div className="dsr-stat-label">Running now</div><div className="dsr-stat-value text-emerald-300">{running.length}</div></div>
   <div className="dsr-stat"><div className="dsr-stat-label">Total stands</div><div className="dsr-stat-value">{stands.length}</div></div>
   <div className="dsr-stat"><div className="dsr-stat-label">Last updated</div><div className="dsr-stat-value text-base">Live</div></div>
  </section>
  <section className="mechanical-panel overflow-hidden"><div className="dsr-panel-head"><div><div className="dsr-kicker">Finishing Mill</div><div className="font-bold text-white">Installed / Running Register</div></div><span className="dsr-chip text-emerald-300">{running.length} running</span></div>
   {loading?<div className="dsr-empty">Loading running stands...</div>:<div className="dsr-table-wrap !rounded-none !border-0"><table className="dsr-table min-w-[760px]"><thead><tr><th className="dsr-th">Stand</th><th className="dsr-th">Installed date</th><th className="dsr-th">How long running</th><th className="dsr-th">Campaign hours</th><th className="dsr-th">Status</th></tr></thead><tbody>
    {stands.map(s=><tr key={s.id}><td className="dsr-td text-base font-black text-white">{s.code}</td><td className="dsr-td">{fmtDate(s.current_installed_at)}</td><td className="dsr-td">{s.current_installed_at?runningDays(s.current_installed_at)+" days":"—"}</td><td className="dsr-td">{Number(s.current_campaign_hours||0).toFixed(1)} h</td><td className="dsr-td"><span className={s.is_running||s.current_installed_at?"text-emerald-300 font-bold":"text-slate-500"}>{s.is_running||s.current_installed_at?"RUNNING":"NOT RUNNING"}</span></td></tr>)}
    {!stands.length&&<tr><td colSpan={5} className="dsr-empty">No stand records returned.</td></tr>}</tbody></table></div>}
  </section>
 </div></main></div>
}