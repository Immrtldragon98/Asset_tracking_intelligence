"use client";
import { useEffect, useState } from "react";
import Header from "@/components/layout/Header";
import { AlertTriangle, BellRing, CheckCircle2, Plus, RefreshCw } from "lucide-react";
import { fetchApi } from "@/lib/api";

type Alert = {id:number;title:string;description:string|null;asset_code:string|null;module_code:string|null;severity:string;due_date:string|null;status:string;created_at:string|null};
type Response = {total:number;alerts:Alert[]};

export default function AlertsPage(){
 const [alerts,setAlerts]=useState<Alert[]>([]);
 const [loading,setLoading]=useState(true);
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 const [title,setTitle]=useState("");
 const [description,setDescription]=useState("");
 const [assetCode,setAssetCode]=useState("");
 const [moduleCode,setModuleCode]=useState("DSIR");
 const [severity,setSeverity]=useState("MEDIUM");
 const [dueDate,setDueDate]=useState("");
 async function load(){setLoading(true);setError("");try{const data=await fetchApi("/alerts") as Response;setAlerts(data.alerts||[])}catch(e){setError(e instanceof Error?e.message:"Could not load alerts")}finally{setLoading(false)}}
 useEffect(()=>{void load()},[]);
 async function createAlert(e:React.FormEvent){e.preventDefault();setSaving(true);setError("");setNotice("");try{await fetchApi("/alerts",{method:"POST",body:JSON.stringify({title,description:description||null,asset_code:assetCode||null,module_code:moduleCode||null,severity,due_date:dueDate||null})});setTitle("");setDescription("");setAssetCode("");setDueDate("");setNotice("Alert created.");await load()}catch(e){setError(e instanceof Error?e.message:"Could not create alert")}finally{setSaving(false)}}
 async function updateStatus(id:number,status:string){try{await fetchApi(`/alerts/${id}`,{method:"PATCH",body:JSON.stringify({status})});await load()}catch(e){setError(e instanceof Error?e.message:"Could not update alert")}}
 return <div className="dsr-page"><Header title="Alerts"/><main className="dsr-main"><div className="full-bleed space-y-5">
  <section className="mechanical-panel p-5"><div className="flex items-start gap-3"><AlertTriangle className="w-5 h-5 text-amber-300 mt-0.5"/><div><div className="dsr-kicker">PLANT MAINTENANCE · ALL REGISTERS</div><h1 className="dsr-title mt-1">Alerts & reminders</h1><p className="dsr-subtitle mt-2">Create and track equipment alerts, maintenance reminders, electrical issues and inspection follow-ups.</p></div></div></section>
  <section className="mechanical-panel p-5"><div className="flex items-center gap-2 mb-4"><Plus className="w-4 h-4"/><h2 className="font-semibold">Add alert</h2></div>
   <form onSubmit={createAlert} className="grid grid-cols-1 md:grid-cols-2 gap-3">
    <label className="text-xs text-slate-400">Alert title *<input required minLength={2} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. VFD cooling fan inspection" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"/></label>
    <label className="text-xs text-slate-400">Related asset / equipment code<input value={assetCode} onChange={e=>setAssetCode(e.target.value)} placeholder="e.g. DIR-024 or stand code" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"/></label>
    <label className="text-xs text-slate-400">Register<select value={moduleCode} onChange={e=>setModuleCode(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">{["DSIR","RMIR","MIR","DIR","SSIR","GENERAL"].map(x=><option key={x}>{x}</option>)}</select></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs text-slate-400">Severity<select value={severity} onChange={e=>setSeverity(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">{["LOW","MEDIUM","HIGH","CRITICAL"].map(x=><option key={x}>{x}</option>)}</select></label><label className="text-xs text-slate-400">Due date<input type="date" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"/></label></div>
    <label className="text-xs text-slate-400 md:col-span-2">Description / action required<textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="Describe the condition, inspection or action to follow up…" className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white"/></label>
    <div className="md:col-span-2"><button disabled={saving} className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60">{saving?"Saving alert…":"Create alert"}</button></div>
   </form>
   {error&&<p className="mt-3 rounded-lg border border-red-900 bg-red-950/30 p-3 text-sm text-red-300">{error}</p>}{notice&&<p className="mt-3 rounded-lg border border-emerald-900 bg-emerald-950/30 p-3 text-sm text-emerald-300">{notice}</p>}
  </section>
  <section className="mechanical-panel p-5"><div className="flex items-center justify-between gap-3 mb-4"><div className="flex items-center gap-2"><BellRing className="w-4 h-4 text-amber-300"/><h2 className="font-semibold">Alert register <span className="text-slate-500 font-normal">({alerts.length})</span></h2></div><button onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs"><RefreshCw className="w-3 h-3"/>Refresh</button></div>
   {loading?<p className="py-8 text-center text-sm text-slate-400">Loading alerts…</p>:alerts.length===0?<div className="py-10 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-slate-600"/><p className="mt-3 text-sm text-slate-400">No alerts yet. Add the first one above.</p></div>:<div className="space-y-3">{alerts.map(a=><article key={a.id} className="rounded-xl border border-slate-700/70 bg-slate-950/50 p-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-white">{a.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${a.severity==="CRITICAL"||a.severity==="HIGH"?"bg-red-950 text-red-300":"bg-amber-950 text-amber-300"}`}>{a.severity}</span><span className="rounded-full bg-slate-800 px-2 py-1 text-[10px] text-slate-300">{a.status}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-400">{a.description||"No description provided."}</p><div className="mt-2 text-xs text-slate-500">{a.module_code||"GENERAL"}{a.asset_code?` · ${a.asset_code}`:""}{a.due_date?` · Due ${a.due_date}`:""}</div></div><div className="flex shrink-0 flex-wrap gap-2">{a.status==="OPEN"&&<button onClick={()=>void updateStatus(a.id,"ACKNOWLEDGED")} className="rounded-lg border border-slate-600 px-3 py-2 text-xs">Acknowledge</button>}{a.status!=="RESOLVED"&&<button onClick={()=>void updateStatus(a.id,"RESOLVED")} className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-slate-950">Resolve</button>}{a.status==="RESOLVED"&&<button onClick={()=>void updateStatus(a.id,"OPEN")} className="rounded-lg border border-slate-600 px-3 py-2 text-xs">Reopen</button>}</div></div></article>)}</div>}
  </section>
 </div></main></div>
}
