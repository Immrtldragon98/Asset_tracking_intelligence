"use client";
import RegisterContext from "@/components/workspace/RegisterContext";

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
 {label:"Coupler · gearbox side",key:"COUPLER_GB_SIDE",icon:Circle},
 {label:"Coupler · motor side",key:"COUPLER_MOTOR_SIDE",icon:Circle},
 {label:"Motor",key:"MOTOR",icon:Zap},
];

function matchesComponent(row:Life,key:string){
 if(row.component_type===key||(key==="GEARBOX"&&row.component_type==="GB"))return true;
 if(row.component_type!=="COUPLER")return false;
 const side=(row.component_side||"").toUpperCase().replaceAll(" ","_");
 return key==="COUPLER_GB_SIDE"?["GB","GB_SIDE","GEARBOX","GEARBOX_SIDE"].includes(side):key==="COUPLER_MOTOR_SIDE"?["MOTOR","MOTOR_SIDE"].includes(side):false;
}
export default function RMIRPage(){
 const [config,setConfig]=useState<Config|null>(null);
 const [assets,setAssets]=useState<Asset[]>([]);
 const [componentLife,setComponentLife]=useState<Life[]>([]);
 const [loading,setLoading]=useState(true); const [error,setError]=useState("");
 const load=async()=>{setLoading(true);try{setError("");const result=await Promise.allSettled([fetchApi("/assets/running-config/RMIR"),fetchApi("/assets/RMIR"),fetchApi("/reliability/components?module=RMIR")]);if(result[0].status==="fulfilled")setConfig(result[0].value);if(result[1].status==="fulfilled")setAssets(result[1].value.assets||[]);if(result[2].status==="fulfilled")setComponentLife(result[2].value.components||[]);const failed=result.flatMap((row,index)=>row.status==="rejected"?[["Lineup","Registry assets","Component history"][index]+": "+(row.reason instanceof Error?row.reason.message:"unavailable")]:[]);setError(failed.join(" · "));}catch(e){setError(e instanceof Error?e.message:"Could not load RMIR running configuration")}finally{setLoading(false)}};
 useEffect(()=>{load()},[]);
 return <main className="min-h-screen bg-[#080D16] text-slate-100"><RegisterContext module="RMIR" label="Roughing Mill register"/>
  <header className="border-b border-[#26354a] bg-[#0b111d] px-4 md:px-7 py-4"><div className="max-w-[1800px] mx-auto flex items-center justify-between gap-4">
   <div className="flex items-center gap-3"><Link href="/dashboard" className="w-9 h-9 rounded-lg border border-[#33445b] bg-[#101827] grid place-items-center"><ArrowLeft className="w-4 h-4"/></Link><div><div className="text-[10px] uppercase tracking-[.16em] text-slate-500 font-bold">RMIR · Roughing Mill</div><h1 className="text-lg md:text-xl font-bold text-white">Configured stand lineup</h1></div></div>
   <button onClick={load} className="dsr-btn"><RefreshCw className="w-4 h-4"/>Refresh</button>
  </div></header>
  <div className="max-w-[1800px] mx-auto px-3 md:px-6 py-5">
   <section className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
    <div className="dsr-stat"><div className="dsr-stat-label">Configured positions</div><div className="dsr-stat-value text-emerald-300">{config?.total_running??"—"}</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Configured lines</div><div className="dsr-stat-value">{config?Object.keys(config.lines||{}).length:"—"}</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Registered assets</div><div className="dsr-stat-value">{assets.length}</div></div>
    <div className="dsr-stat"><div className="dsr-stat-label">Status</div><div className="dsr-stat-value text-base text-emerald-300">CONFIGURED</div></div>
   </section>
   {error&&<div className="mb-4 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
   <section className="rounded-xl border border-[#253247] overflow-hidden">
    <div className="px-4 py-4 bg-[#151F2E] border-b border-[#253247]"><div className="text-[10px] uppercase tracking-[.12em] text-slate-500 font-bold">Roughing Mill</div><div className="text-xl font-semibold text-white mt-1">Current Running Configuration</div><p className="text-xs text-slate-400 mt-1">Saved lineup reference; verify physical installations during commissioning. Component dates come from lifecycle records.</p></div>
    {loading?<div className="p-8 text-center text-sm text-slate-500">Loading RMIR configuration...</div>:<div className="p-3 space-y-3">
     {Object.entries(config?.lines||{}).map(([line,stands])=><div key={line} className="rounded-xl border border-[#253247] bg-[#0b111d] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#253247] flex items-center justify-between"><div className="font-bold text-white">{line}</div><div className="text-xs font-bold text-emerald-300">{stands.length}/5 CONFIGURED</div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 p-3">{stands.map((code,i)=>{const rows=componentLife.filter(x=>(x.line_name||"").toUpperCase()===line.toUpperCase()&&(x.stand_code||"").toUpperCase()===code.toUpperCase()&&!x.removed_on);return <article key={code} className="rounded-lg border border-emerald-900/60 bg-emerald-950/15 p-3">
       <div className="flex items-center justify-between"><div><div className="text-[10px] text-slate-500">RM Stand {i+1}</div><div className="text-xl font-black text-white">{code}</div></div><span className="text-[9px] font-bold text-emerald-300">CONFIGURED</span></div>
       <div className="mt-3 space-y-1.5">{components.map(c=>{const Icon=c.icon;return <div key={c.key} className="flex items-center gap-2 text-[10px] text-slate-400"><Icon className="w-3.5 h-3.5 text-slate-600"/><span>{c.label}</span><span className={rows.some(x=>matchesComponent(x,c.key))?"ml-auto text-emerald-300":"ml-auto text-slate-600"}>{(()=>{const row=rows.find(x=>matchesComponent(x,c.key));return row?`Installed ${row.installed_on}`:"Not recorded"})()}</span></div>})}</div>
      </article>})}</div>
     </div>)}
    </div>}
   </section>
   <section className="mt-5 rounded-xl border border-[#253247] bg-[#101827] overflow-hidden">
    <div className="px-4 py-4 border-b border-[#253247] flex flex-wrap items-center justify-between gap-3"><div><div className="text-[10px] uppercase tracking-[.12em] text-slate-500 font-bold">Component lifecycle</div><div className="text-lg font-semibold text-white mt-1">Installed dates · GB, motor, floating shaft & couplers</div><p className="text-xs text-slate-400 mt-1">Motor-side and gearbox-side couplers are tracked separately. Add missing installation dates in Reliability Intelligence.</p></div><Link href="/reliability?module=RMIR" className="dsr-btn">Open reliability workspace →</Link></div>
    <div className="overflow-x-auto"><table className="dsr-table min-w-[850px]"><thead><tr>{["Line","Position","Stand","Component","Side","Installed","Age (days)","Life (hours)"].map(x=><th className="dsr-th" key={x}>{x}</th>)}</tr></thead><tbody>{componentLife.filter(x=>!x.removed_on).map(x=><tr key={x.id}><td className="dsr-td">{x.line_name||"—"}</td><td className="dsr-td">{x.position_number??"—"}</td><td className="dsr-td">{x.stand_code||"—"}</td><td className="dsr-td font-semibold">{x.component_type.replaceAll("_"," ")}</td><td className="dsr-td">{x.component_side||"—"}</td><td className="dsr-td">{x.installed_on}</td><td className="dsr-td">{x.life_days}</td><td className="dsr-td">{x.observed_life_hours??"Meter readings needed"}</td></tr>)}{!componentLife.some(x=>!x.removed_on)&&<tr><td colSpan={8} className="dsr-empty">No component installation dates have been recorded yet.</td></tr>}</tbody></table></div>
   </section>
   <section className="mt-5 rounded-xl border border-[#253247] bg-[#101827] p-4"><div className="flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400"/><div><div className="text-sm font-semibold text-white">Lineup evidence</div><div className="text-xs text-slate-500 mt-1">A configured lineup is a reference, not proof that equipment is running. Confirm installations, line location and operating state from plant records before relying on the configuration.</div></div></div></section>
   <div className="mt-3 text-xs text-slate-500">Configured lineup · Register asset records available: {assets.length} · Active component lifecycle records: {componentLife.filter(x=>!x.removed_on).length}</div>
  </div>
 </main>;
}