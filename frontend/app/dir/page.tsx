"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Zap, Package, Gauge, AlertTriangle, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Drive = {
  id:number; asset_code:string; name:string; asset_type:string; position:string|null;
  status:string; criticality:string; parent_id:number|null; operating_hours:number;
  lifetime_hours:number; manufacturer?:string|null; model?:string|null; area?:string|null;
  location?:string|null; notes?:string|null;
};

export default function DIRPage(){
 const [assets,setAssets]=useState<Drive[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const [query,setQuery]=useState("");
 const [area,setArea]=useState("ALL");
 const [make,setMake]=useState("ALL");
 const [selected,setSelected]=useState<Drive|null>(null);
 async function load(){
   setLoading(true); setError("");
   try { const d=await fetchApi("/assets/DIR"); setAssets(d.assets||[]); }
   catch(e){setError(e instanceof Error?e.message:"Could not load drive register");}
   finally{setLoading(false);}
 }
 useEffect(()=>{load()},[]);
 const areas=useMemo(()=>["ALL",...Array.from(new Set(assets.map(a=>a.area||a.position||"Unspecified"))).sort()], [assets]);
 const makes=useMemo(()=>["ALL",...Array.from(new Set(assets.map(a=>a.manufacturer||"Unspecified"))).sort()], [assets]);
 const filtered=assets.filter(a=>{
  const text=[a.asset_code,a.name,a.asset_type,a.position,a.manufacturer,a.model,a.area,a.location,a.notes].join(" ").toLowerCase();
  return text.includes(query.toLowerCase()) && (area==="ALL"||(a.area||a.position||"Unspecified")===area) && (make==="ALL"||(a.manufacturer||"Unspecified")===make);
 });
 const active=assets.filter(a=>["ACTIVE","RUNNING","INSTALLED","IN_SERVICE","OPERATIONAL","COMMISSIONED"].includes(a.status.toUpperCase())).length;
 const high=assets.filter(a=>a.criticality==="HIGH").length;
 return <main className="min-h-screen bg-[#080D16] text-slate-100 px-4 py-5 md:px-7">
  <div className="max-w-[1500px] mx-auto">
   <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white"><ArrowLeft className="w-4 h-4"/>All registers</Link>
   <header className="mt-5 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
    <div><div className="text-[10px] uppercase tracking-[.2em] font-bold text-sky-400">DIR · CH#2 drive inventory</div><h1 className="mt-2 text-3xl font-bold">Drive Intelligent Register</h1><p className="mt-2 text-sm text-slate-400 max-w-3xl">Plant VFD and drive inventory based on the supplied “CH#2, VFD Used List (20.07)” workbook. Drive identity, panel/location, make/model, motor data and spare availability.</p></div>
    <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"><RefreshCw className="w-4 h-4"/>Refresh data</button>
   </header>
   <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
    <Metric icon={<Zap className="w-4 h-4"/>} label="Registered drives" value={assets.length}/>
    <Metric icon={<Gauge className="w-4 h-4"/>} label="Active / in service" value={active}/>
    <Metric icon={<AlertTriangle className="w-4 h-4"/>} label="High criticality" value={high}/>
    <Metric icon={<Package className="w-4 h-4"/>} label="Distinct areas" value={new Set(assets.map(a=>a.area||a.position).filter(Boolean)).size}/>
   </section>
   <section className="mt-5 rounded-xl border border-[#26354a] bg-[#101827] p-3 md:p-4">
    <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_220px_220px] gap-3">
     <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#080D16] px-3"><Search className="w-4 h-4 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search equipment, model, panel, IP…" className="w-full bg-transparent py-2.5 text-sm outline-none"/></label>
     <select value={area} onChange={e=>setArea(e.target.value)} className="rounded-lg border border-slate-700 bg-[#080D16] px-3 py-2.5 text-sm"><option value="ALL">All areas</option>{areas.filter(x=>x!=="ALL").map(x=><option key={x}>{x}</option>)}</select>
     <select value={make} onChange={e=>setMake(e.target.value)} className="rounded-lg border border-slate-700 bg-[#080D16] px-3 py-2.5 text-sm"><option value="ALL">All VFD makes</option>{makes.filter(x=>x!=="ALL").map(x=><option key={x}>{x}</option>)}</select>
    </div>
    {error&&<div className="mt-3 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
    {loading?<div className="py-12 text-center text-sm text-slate-400">Loading drive inventory…</div>:assets.length===0?<div className="py-12 text-center"><Zap className="mx-auto w-8 h-8 text-slate-600"/><h2 className="mt-3 font-semibold">Drive data not imported yet</h2><p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">The register layout is ready, but the uploaded workbook rows must be imported into the shared asset database before live records appear here.</p></div>:<><div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>Showing {filtered.length} of {assets.length} drives</span><span>Click a row for full record</span></div>
     <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-[#0b111d] text-[10px] uppercase tracking-wider text-slate-500"><tr>{["Drive / equipment","Area","Location","VFD make","Rating / model","Panel location","Status","Criticality"].map(h=><th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{filtered.map(a=><tr key={a.id} onClick={()=>setSelected(a)} className="border-t border-slate-800/80 hover:bg-slate-800/40 cursor-pointer"><td className="px-3 py-3"><div className="font-semibold text-white">{a.name}</div><div className="mt-1 text-[10px] text-slate-500">{a.asset_code} · {a.asset_type.replaceAll("_"," ")}</div></td><td className="px-3 py-3 text-slate-300">{a.area||"—"}</td><td className="px-3 py-3 text-slate-300">{a.location||a.position||"—"}</td><td className="px-3 py-3">{a.manufacturer||"—"}</td><td className="px-3 py-3"><div>{a.model||"—"}</div><div className="text-[10px] text-slate-500">{a.notes||""}</div></td><td className="px-3 py-3 text-slate-400">{a.position||"—"}</td><td className="px-3 py-3"><span className="rounded-full border border-slate-700 px-2 py-1 text-[10px]">{a.status}</span></td><td className="px-3 py-3">{a.criticality}</td></tr>)}</tbody></table></div>
    </>}
   </section>
   {selected&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 md:items-center md:p-5" onClick={()=>setSelected(null)}><section className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-t-2xl border border-slate-700 bg-[#101827] p-5 md:rounded-xl" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] uppercase tracking-widest text-sky-400">Drive record</div><h2 className="mt-1 text-xl font-bold">{selected.name}</h2><p className="text-xs text-slate-500">{selected.asset_code}</p></div><button onClick={()=>setSelected(null)} className="rounded-md border border-slate-700 px-3 py-1.5 text-sm">Close</button></div><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">{[["Type",selected.asset_type],["Area",selected.area],["Location",selected.location],["VFD make",selected.manufacturer],["Model",selected.model],["Status",selected.status],["Criticality",selected.criticality],["Operating hours",selected.operating_hours],["Lifetime hours",selected.lifetime_hours],["Notes",selected.notes]].map(([k,v])=><div key={k} className="rounded-lg border border-slate-800 bg-[#080D16] p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div><div className="mt-1 break-words text-sm text-slate-200">{v==null||v===""?"—":String(v)}</div></div>)}</div></section></div>}
  </div>
 </main>
}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:number}){return <div className="rounded-xl border border-[#26354a] bg-[#101827] p-4"><div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div><div className="mt-2 text-2xl font-bold text-white">{value}</div></div>}
