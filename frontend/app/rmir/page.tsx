"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, Activity, Cog, Settings2, Wrench, Circle, Zap } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Config={module:string;area:string;lines:Record<string,string[]>;total_running:number;updated_at?:string};
type Asset={asset_code:string;asset_type:string;parent_id:number|null;installation_date:string|null;operating_hours:number;status:string;is_running?:boolean};
type Life={id:number;module_code:string;line_name?:string;position_number?:number;stand_code?:string;component_type:string;component_side?:string;serial_number?:string;installed_on:string;removed_on?:string|null;life_days:number;observed_life_hours?:number|null;removal_reason?:string|null};

const components=[
 {label:"Gearbox",key:"GEARBOX",icon:Cog},
 {label:"Entry Guide",key:"ENTRY_GUIDE",icon:Settings2},
 {label:"Floating Shaft",key:"FLOATING_SHAFT",icon:Wrench},
 {label:"Coupler",key:"COUPLER",icon:Circle},
 {label:"Motor",key:"MOTOR",icon:Zap},
];

export default function RMIRPage(){
 const [config,setConfig]=useState<Config|null>(null);
 const [assets,setAssets]=useState<Asset[]>([]);
 const [componentLife,setComponentLife]=useState<Life[]>([]);
 const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 const load=async()=>{setLoading(true);try{setError("");const [c,a,l]=await Promise.all([fetchApi("/assets/running-config/RMIR"),fetchApi("/assets/RMIR"),fetchApi("/reliability/components?module=RMIR")]);setConfig(c);setAssets(a.assets||[]);setComponentLife(l.components||[]);}catch(e){setError(e instanceof Error?e.message:"Could not load RMIR running configuration")}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 return <main className="min-h-screen bg-[#080D16] text-slate-100">
  <header className="border-b border-[#26354a] bg-[#0b111d] px-4 md:px-7 py-4"><div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
   <div className="flex items-center gap-3"><Link href="/dashboard" className="w-9 h-9 rounded-lg border border-[#33445b] bg-[#101827] grid place-items-center"><ArrowLeft className="w-4 h-4"/></Link><div><div className="text-[10px] uppercase tracking-[.16em] text-slate-500 font-bold">RMIR · Roughing Mill</div><h1 className="text-lg md:text-xl font-bold text-white">Running Stand Status</h1></div></div>
   <button onClick={load} className="dsr-btn"><RefreshCw className="w-4 h-4"/>Refresh</button>
  </div></header>
  <div className="max-w-[1800px] mx-auto px-3 md:px-6 py-5">
   <section className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
    <div className="dsr-stat"><div className="dsr-stat-label">Running stands</div><div className="dsr-stat-value text-emerald-300">{config?.total_running??0}</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Running lines</div><div className="dsr-stat-value">3</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Stands / line</div><div className="dsr-stat-value">5</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Status</div><div className="dsr-stat-value text-base text-emerald-300">LIVE CONFIG</div></div>
   </section>
   {error&&<div className="mb-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
   <section className="rounded-xl border border-[#253247] overflow-hidden">
    <div className="px-4 py-4 bg-[#151F2E] border-b border-[#253247]"><div className="text-[10px] uppercase tracking-[.12em] text-slate-500 font-bold">Roughing Mill</div><div className="text-xl font-semibold text-white mt-1">Current Running Configuration</div><p className="text-xs text-slate-400 mt-1">WRM1 / WRM2 / WRM3 with five running stands on each line.</p></div>
    {loading?<div className="p-8 text-center text-sm text-slate-500">Loading RMIR configuration...</div>:<div className="p-3 space-y-3">
     {Object.entries(config?.lines||{}).map(([line,stands])=><div key={line} className="rounded-xl border border-[#253247] bg-[#0b111d] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#253247] flex items-center justify-between"><div className="font-bold text-white">{line}</div><div className="text-xs font-bold text-emerald-300">{stands.length}/5 RUNNING</div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-3">{stands.map((code,i)=><article key={code} className="rounded-lg border border-emerald-900/60 bg-emerald-950/15 p-3">
       <div className="flex items-center justify-between"><div><div className="text-[10px] text-slate-500">RM Stand {i+1}</div><div className="text-xl font-black text-white">{code}</div></div><span className="text-[9px] font-bold text-emerald-300">RUNNING</span></div>
       <div className="mt-3 space-y-1.5">{components.map(c=>{const Icon=c.icon;return <div key={c.key} className="flex items-center gap-2 text-[10px] text-slate-400"><Icon className="w-3.5 h-3.5 text-slate-600"/><span>{c.label}</span><span className="ml-auto text-slate-600">asset data</span></div>})}</div>
      </article>)}</div>
     </div>)}
    </div>}
   </section>
   <section className="mt-5 rounded-xl border border-[#253247] bg-[#101827] overflow-hidden">
    <div className="px-4 py-4 border-b border-[#253247] flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[.12em] text-slate-500 font-bold">Component lifecycle</div><div className="text-lg font-semibold text-white mt-1">Installed dates · GB, motor, floating shaft & couplers</div><p className="text-xs text-slate-400 mt-1">Motor-side and gearbox-side couplers are tracked separately. Add missing installation dates in Reliability Intelligence.</p></div><Link href="/reliability?module=RMIR" className="dsr-btn">Open reliability workspace →</Link></div>
    <div className="overflow-x-auto"><table className="dsr-table min-w-[850px]"><thead><tr>{["Line","Position","Stand","Component","Side","Installed","Age (days)","Life (hours)"].map(x=><th className="dsr-th" key={x}>{x}</th>)}</tr></thead><tbody>{componentLife.filter(x=>!x.removed_on).map(x=><tr key={x.id}><td className="dsr-td">{x.line_name||"—"}</td><td className="dsr-td">{x.position_number??"—"}</td><td className="dsr-td">{x.stand_code||"—"}</td><td className="dsr-td font-semibold">{x.component_type.replaceAll("_"," ")}</td><td className="dsr-td">{x.component_side||"—"}</td><td className="dsr-td">{x.installed_on}</td><td className="dsr-td">{x.life_days}</td><td className="dsr-td">{x.observed_life_hours??"Meter readings needed"}</td></tr>)}{!componentLife.some(x=>!x.removed_on)&&<tr><td colSpan={8} className="dsr-empty">No component installation dates have been recorded yet.</td></tr>}</tbody></table></div>
   </section>
   <section className="mt-5 rounded-xl border border-[#253247] bg-[#101827] p-4"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400"/><div><div className="text-sm font-semibold text-white">RMIR running-status rule</div><div className="text-xs text-slate-500 mt-1">The current plant configuration is authoritative for which RM stands are running. Asset records continue to supply installation, operating-hour and component details when entered.</div></div></div></section>
   <div className="mt-3 text-xs text-slate-500">Configured current plant lineup · Last configured: 08 Oct 2026 · Register asset records available: {assets.length}</div>
  </div>
 </main>;
}