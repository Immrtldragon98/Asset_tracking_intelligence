"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Zap, Package, Gauge, RefreshCw, Upload, HardDrive, AlertTriangle } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Drive = {
  id:number; source_row:number; asset_code:string; name:string; area:string|null; location:string|null;
  supply_from:string|null; panel_location:string|null; manufacturer:string|null; rating:string|null;
  module_quantity:string|null; model:string|null; spare_available:string|null; spare_location:string|null;
  ip_address:string|null; module_power_supply:string|null; motor_kw:number|null; voltage:string|null;
  motor_rpm:number|null; motor_flc_amp:number|null; installation_date:string|null; running_hours:number; status:string; criticality:string; notes:string|null;
};
type DirResponse = { assets:Drive[]; total:number; distinct_makes:number; distinct_areas:number };

export default function DIRPage(){
 const [assets,setAssets]=useState<Drive[]>([]);
 const [loading,setLoading]=useState(true);
 const [uploading,setUploading]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [query,setQuery]=useState("");
 const [area,setArea]=useState("ALL");
 const [make,setMake]=useState("ALL");
 const [selected,setSelected]=useState<Drive|null>(null);
 const [installedDate,setInstalledDate]=useState("");
 const [runningHours,setRunningHours]=useState("0");
 const [savingUsage,setSavingUsage]=useState(false);

 async function load(){
   setLoading(true); setError("");
   try { const d=await fetchApi("/dir/drives") as DirResponse; setAssets(d.assets||[]); }
   catch(e){setError(e instanceof Error?e.message:"Could not load drive register");}
   finally{setLoading(false);}
 }
 useEffect(()=>{load()},[]);

 async function saveUsage(){
   if(!selected)return;
   setSavingUsage(true);setError("");setNotice("");
   try{
     const updated=await fetchApi(`/dir/drives/${selected.id}/usage`,{method:"PATCH",body:JSON.stringify({installation_date:installedDate||null,running_hours:Number(runningHours)})}) as Drive;
     setSelected(updated);setAssets(prev=>prev.map(a=>a.id===updated.id?updated:a));setNotice("Installation date and running hours saved.");
   }catch(e){setError(e instanceof Error?e.message:"Could not save usage details");}
   finally{setSavingUsage(false);}
 }
 async function importWorkbook(event:ChangeEvent<HTMLInputElement>){
   const file=event.target.files?.[0];
   if(!file)return;
   setUploading(true);setError("");setNotice("");
   try{
     const form=new FormData();form.append("file",file);
     const result=await fetchApi("/dir/import",{method:"POST",body:form}) as {imported:number;skipped:number;total:number};
     setNotice(`Import complete: ${result.imported} rows processed, ${result.skipped} skipped. ${result.total} DIR records now stored.`);
     await load();
   }catch(e){setError(e instanceof Error?e.message:"Workbook import failed");}
   finally{setUploading(false);event.target.value="";}
 }
 const areas=useMemo(()=>["ALL",...Array.from(new Set(assets.map(a=>a.area||"Unspecified"))).sort()], [assets]);
 const makes=useMemo(()=>["ALL",...Array.from(new Set(assets.map(a=>a.manufacturer||"Unspecified"))).sort()], [assets]);
 const filtered=assets.filter(a=>{
  const text=[a.asset_code,a.name,a.area,a.location,a.supply_from,a.panel_location,a.manufacturer,a.rating,a.model,a.spare_available,a.spare_location,a.ip_address,a.module_power_supply,a.motor_kw,a.voltage,a.motor_rpm,a.motor_flc_amp].join(" ").toLowerCase();
  return text.includes(query.toLowerCase()) && (area==="ALL"||(a.area||"Unspecified")===area) && (make==="ALL"||(a.manufacturer||"Unspecified")===make);
 });
 const withIp=assets.filter(a=>a.ip_address).length;
 const withSpare=assets.filter(a=>a.spare_available).length;
 return <main className="min-h-screen bg-[#080D16] text-slate-100 px-4 py-5 md:px-7">
  <div className="max-w-[1500px] mx-auto">
   <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-white"><ArrowLeft className="w-4 h-4"/>All registers</Link>
   <header className="mt-5 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
    <div><div className="text-[10px] uppercase tracking-[.2em] font-bold text-sky-400">DIR · CH#2 VFD inventory</div><h1 className="mt-2 text-3xl font-bold">Drive Intelligent Register</h1><p className="mt-2 text-sm text-slate-400 max-w-3xl">Structured register for the supplied CH#2 VFD workbook, retaining the source’s area, equipment, panel, drive make/model, spare and motor electrical details.</p></div>
    <div className="flex flex-wrap gap-2">
      <label className={`inline-flex items-center justify-center gap-2 rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-slate-950 cursor-pointer hover:bg-sky-400 ${uploading?"opacity-60 pointer-events-none":""}`}><Upload className="w-4 h-4"/>{uploading?"Importing workbook…":"Import .xlsx"}<input type="file" accept=".xlsx" className="hidden" disabled={uploading} onChange={importWorkbook}/></label>
      <button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"><RefreshCw className="w-4 h-4"/>Refresh</button>
    </div>
   </header>
   <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
    <Metric icon={<Zap className="w-4 h-4"/>} label="Registered drives" value={assets.length}/>
    <Metric icon={<Gauge className="w-4 h-4"/>} label="Records with IP" value={withIp}/>
    <Metric icon={<Package className="w-4 h-4"/>} label="Spare info recorded" value={withSpare}/>
    <Metric icon={<HardDrive className="w-4 h-4"/>} label="Distinct areas" value={new Set(assets.map(a=>a.area).filter(Boolean)).size}/>
   </section>
   <section className="mt-5 rounded-xl border border-[#26354a] bg-[#101827] p-3 md:p-4">
    <div className="grid grid-cols-1 md:grid-cols-[minmax(200px,1fr)_220px_220px] gap-3">
     <label className="flex items-center gap-2 rounded-lg border border-slate-700 bg-[#080D16] px-3"><Search className="w-4 h-4 text-slate-500"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search equipment, model, panel, IP…" className="w-full bg-transparent py-2.5 text-sm outline-none"/></label>
     <select value={area} onChange={e=>setArea(e.target.value)} className="rounded-lg border border-slate-700 bg-[#080D16] px-3 py-2.5 text-sm"><option value="ALL">All areas</option>{areas.filter(x=>x!=="ALL").map(x=><option key={x}>{x}</option>)}</select>
     <select value={make} onChange={e=>setMake(e.target.value)} className="rounded-lg border border-slate-700 bg-[#080D16] px-3 py-2.5 text-sm"><option value="ALL">All VFD makes</option>{makes.filter(x=>x!=="ALL").map(x=><option key={x}>{x}</option>)}</select>
    </div>
    {error&&<div className="mt-3 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</div>}
    {notice&&<div className="mt-3 rounded-lg border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-300">{notice}</div>}
    {loading?<div className="py-12 text-center text-sm text-slate-400">Loading drive inventory…</div>:assets.length===0?<div className="py-12 text-center"><Zap className="mx-auto w-8 h-8 text-slate-600"/><h2 className="mt-3 font-semibold">Import the CH#2 workbook</h2><p className="mt-2 text-sm text-slate-500 max-w-lg mx-auto">Choose the supplied VFD Used List .xlsx file above. The first worksheet is parsed and stored in a dedicated DIR table; re-importing updates the matching source rows.</p></div>:<>
     <div className="mt-4 flex items-center justify-between text-xs text-slate-500"><span>Showing {filtered.length} of {assets.length} records</span><span>Click a row to inspect full details</span></div>
     <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800"><table className="w-full min-w-[1200px] text-left text-sm"><thead className="bg-[#0b111d] text-[10px] uppercase tracking-wider text-slate-500"><tr>{["Equipment","Area / location","VFD make","Rating / model","Panel location","Motor kW","Installed on","Running hours","IP address","Spare availability"].map(h=><th key={h} className="px-3 py-3 font-semibold">{h}</th>)}</tr></thead><tbody>{filtered.map(a=><tr key={a.id} onClick={()=>{setSelected(a);setInstalledDate(a.installation_date||"");setRunningHours(String(a.running_hours||0));}} className="border-t border-slate-800/80 hover:bg-slate-800/40 cursor-pointer"><td className="px-3 py-3"><div className="font-semibold text-white">{a.name}</div><div className="mt-1 text-[10px] text-slate-500">{a.asset_code} · row {a.source_row}</div></td><td className="px-3 py-3 text-slate-300"><div>{a.area||"—"}</div><div className="text-[10px] text-slate-500">{a.location||"—"}</div></td><td className="px-3 py-3">{a.manufacturer||"—"}</td><td className="px-3 py-3"><div>{a.rating||"—"}</div><div className="text-[10px] text-slate-500">{a.model||"No model listed"}</div></td><td className="px-3 py-3 text-slate-400">{a.panel_location||"—"}</td><td className="px-3 py-3">{a.motor_kw==null?"—":a.motor_kw}</td><td className="px-3 py-3 text-slate-400">{a.installation_date||"Not set"}</td><td className="px-3 py-3 tabular-nums">{Number(a.running_hours||0).toLocaleString()} h</td><td className="px-3 py-3 text-slate-400">{a.ip_address||"—"}</td><td className="px-3 py-3 text-slate-300">{a.spare_available||"—"}</td></tr>)}</tbody></table></div>
    </>}
   </section>
   {selected&&<div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 md:items-center md:p-5" onClick={()=>setSelected(null)}><section className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-t-2xl border border-slate-700 bg-[#101827] p-5 md:rounded-xl" onClick={e=>e.stopPropagation()}><div className="flex items-start justify-between gap-3"><div><div className="text-[10px] uppercase tracking-widest text-sky-400">DIR source row {selected.source_row}</div><h2 className="mt-1 text-xl font-bold">{selected.name}</h2><p className="text-xs text-slate-500">{selected.asset_code}</p></div><button onClick={()=>setSelected(null)} className="rounded-md border border-slate-700 px-3 py-1.5 text-sm">Close</button></div><div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">{[["Area",selected.area],["Installation date",selected.installation_date],["Running hours",selected.running_hours],["Equipment location",selected.location],["Supply from",selected.supply_from],["Panel location",selected.panel_location],["VFD make",selected.manufacturer],["VFD rating",selected.rating],["Model number",selected.model],["Module quantity",selected.module_quantity],["Spare availability",selected.spare_available],["Spare location",selected.spare_location],["IP address",selected.ip_address],["VFD module power supply",selected.module_power_supply],["Motor kW",selected.motor_kw],["Voltage",selected.voltage],["Motor RPM",selected.motor_rpm],["Motor FLC (A)",selected.motor_flc_amp],["Notes",selected.notes]].map(([k,v])=><div key={k} className="rounded-lg border border-slate-800 bg-[#080D16] p-3"><div className="text-[10px] uppercase tracking-wider text-slate-500">{k}</div><div className="mt-1 break-words text-sm text-slate-200">{v==null||v===""?"—":String(v)}</div></div>)}</div></section></div>}
  </div>
 </main>
}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:number}){return <div className="rounded-xl border border-[#26354a] bg-[#101827] p-4"><div className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</div><div className="mt-2 text-2xl font-bold text-white">{value}</div></div>}
