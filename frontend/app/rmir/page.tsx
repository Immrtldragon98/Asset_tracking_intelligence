"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, CheckCircle2, Circle, Cog, Gauge, RefreshCw, Settings2, Wrench, Zap } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Asset={id:number;asset_code:string;name:string;asset_type:string;position:string|null;status:string;installation_date:string|null;parent_id:number|null;operating_hours:number;lifetime_hours:number};

const componentOrder=[
 {key:"GEARBOX",label:"Gearbox",short:"GB",icon:Cog},
 {key:"ENTRY_GUIDE",label:"Entry Guide",short:"EG",icon:Settings2},
 {key:"FLOATING_SHAFT",label:"Floating Shaft",short:"Shaft",icon:Wrench},
 {key:"COUPLER",label:"Coupler",short:"Coupler",icon:Circle},
 {key:"MOTOR",label:"Motor",short:"Motor",icon:Zap},
];

function isRunning(a?:Asset){return !!a && ["ACTIVE","RUNNING","INSTALLED"].includes(String(a.status).toUpperCase());}
function statusLabel(a?:Asset){return isRunning(a)?"RUNNING":a?.status||"NOT ENTERED";}
function dateLabel(v:string|null){if(!v)return "Date not entered";const d=new Date(v);return Number.isNaN(d.getTime())?"Date not entered":d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});}

export default function RMIRPage(){
 const [assets,setAssets]=useState<Asset[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 const load=async()=>{setLoading(true);try{setError("");const d=await fetchApi("/assets/RMIR");setAssets(d.assets||[]);}catch(e){setError(e instanceof Error?e.message:"Could not load RMIR")}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 const stands=useMemo(()=>assets.filter(a=>a.asset_type.toUpperCase()==="STAND").sort((a,b)=>Number(a.position||0)-Number(b.position||0)),[assets]);
 const byParent=useMemo(()=>{const m=new Map<number,Asset[]>();assets.forEach(a=>{if(a.parent_id){if(!m.has(a.parent_id))m.set(a.parent_id,[]);m.get(a.parent_id)!.push(a)}});return m},[assets]);
 const runningCount=stands.filter(isRunning).length;
 return <main className="min-h-screen bg-[#080D16] text-slate-100">
  <header className="border-b border-[#26354a] bg-[#0b111d] px-4 md:px-7 py-4">
   <div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
    <div className="flex items-center gap-3"><Link href="/dashboard" className="w-9 h-9 rounded-lg border border-[#33445b] bg-[#101827] grid place-items-center"><ArrowLeft className="w-4 h-4"/></Link><div><div className="text-[10px] uppercase tracking-[.16em] text-slate-500 font-bold">RMIR · Roughing Mill</div><h1 className="text-lg md:text-xl font-bold text-white">Roughing Mill Intelligent Register</h1></div></div>
    <button onClick={load} className="dsr-btn"><RefreshCw className="w-4 h-4"/>Refresh</button>
   </div>
  </header>
  <div className="max-w-[1800px] mx-auto px-3 md:px-6 py-5">
   <section className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
    <div className="dsr-stat"><div className="dsr-stat-label">RM Stands</div><div className="dsr-stat-value">5</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Running</div><div className="dsr-stat-value text-emerald-300">{runningCount}/5</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Register Assets</div><div className="dsr-stat-value">{assets.length}</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Line Status</div><div className="dsr-stat-value text-emerald-300">{runningCount===5?"RUNNING":"PARTIAL"}</div></div>
   </section>
   {error&&<div className="mb-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
   <section className="rounded-xl border border-[#253247] overflow-hidden">
    <div className="px-4 py-4 bg-[#151F2E] border-b border-[#253247]"><div className="text-[10px] uppercase tracking-[.12em] text-slate-500 font-bold">Live equipment board</div><div className="text-xl font-semibold text-white mt-1">Running stand status · RM Line</div><p className="text-xs text-slate-400 mt-1">Stand readiness and the running state of gearbox, entry guide, shaft, couplers and motor.</p></div>
    {loading?<div className="p-8 text-center text-sm text-slate-500">Loading RMIR…</div>:<div className="p-3 bg-[#0f1725] grid grid-cols-1 xl:grid-cols-5 gap-3">
      {[1,2,3,4,5].map(n=>{const stand=stands.find(s=>Number(s.position)===n)||assets.find(s=>s.asset_code===`RM-ST${n}`);const children=stand?byParent.get(stand.id)||[]:[];return <article key={n} className="rounded-xl border border-[#2a3950] bg-[#101827] overflow-hidden">
       <div className="p-4 border-b border-[#26354a] bg-[#111b2b]"><div className="flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-wider text-slate-500">Roughing Mill</div><div className="text-2xl font-bold text-white">Stand {n}</div></div><div className={`px-2 py-1 rounded-md text-[10px] font-bold border ${isRunning(stand)?"border-emerald-800 bg-emerald-950/30 text-emerald-300":"border-slate-700 text-slate-400"}`}>{statusLabel(stand)}</div></div><div className="mt-3 text-xs text-slate-500">Installation <span className="text-slate-300">{dateLabel(stand?.installation_date||null)}</span></div></div>
       <div className="p-3 space-y-2">{componentOrder.map(c=>{const matches=children.filter(x=>x.asset_type.toUpperCase()===c.key);return <div key={c.key} className="flex items-center gap-2.5 rounded-lg border border-[#253247] bg-[#0b111d] px-3 py-2.5"><c.icon className="w-4 h-4 text-slate-500 shrink-0"/><div className="min-w-0 flex-1"><div className="text-xs font-semibold text-slate-200">{c.label}</div><div className="text-[10px] text-slate-500 truncate">{matches.length?matches.map(x=>x.asset_code).join(" · "):"Asset not entered"}</div></div>{matches.length?<div className={isRunning(matches[0])?"text-emerald-300":"text-slate-500"}>{isRunning(matches[0])?<CheckCircle2 className="w-4 h-4"/>:<Circle className="w-4 h-4"/>}</div>:<span className="text-[9px] text-slate-600">—</span>}</div>})}</div>
       <div className="px-3 pb-3"><div className="rounded-lg border border-[#253247] bg-[#0b111d] p-3"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400"/><span className="text-[10px] uppercase tracking-wider text-slate-500">Stand running status</span></div><div className="mt-1 text-sm font-semibold text-emerald-300">{isRunning(stand)?"RUNNING":"NOT RUNNING"}</div><div className="mt-1 text-[10px] text-slate-500">{Number(stand?.operating_hours||0).toFixed(1)} operating hours recorded</div></div></div>
      </article>})}
    </div>}
   </section>
   <section className="mt-5 rounded-xl border border-[#253247] bg-[#101827] p-4"><div className="flex items-center gap-2"><Gauge className="w-4 h-4 text-slate-400"/><div><div className="text-sm font-semibold text-white">RMIR hierarchy</div><div className="text-xs text-slate-500 mt-1">Each stand is the parent of its gearbox, entry guide, floating shaft, GB-side coupler, motor-side coupler and motor.</div></div></div></section>
  </div>
 </main>;
}